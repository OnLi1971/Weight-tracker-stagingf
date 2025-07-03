"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingDown, Calendar, Syringe, Euro, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cs } from 'date-fns/locale';

interface WeightEntry {
  date: Date;
  weight: number;
  dosage: string;
  notes?: string;
  penCost?: number;
  penType?: string;
  penId?: string;
  isNewPen?: boolean;
}

interface GoalSettings {
  targetWeight: number;
  startWeight: number;
}

interface StatsOverviewProps {
  entries: WeightEntry[];
  goalSettings?: GoalSettings;
}

export function StatsOverview({ entries, goalSettings }: StatsOverviewProps) {
  console.log('StatsOverview rendered with entries:', entries);

  const getNextApplicationDate = () => {
    // Get active pens and predict next application
    const pens = new Map();
    
    entries.forEach(entry => {
      if (entry.penId) {
        if (!pens.has(entry.penId)) {
          const penInfo = entry.penType ? {
            id: entry.penId,
            type: entry.penType,
            startDate: entry.date,
            totalCapacity: parseFloat(entry.penType) * 5,
            applications: [],
            totalUsed: 0,
          } : null;
          
          if (penInfo) pens.set(entry.penId, penInfo);
        }
        
        if (pens.has(entry.penId)) {
          const pen = pens.get(entry.penId);
          const dosageAmount = parseFloat(entry.dosage);
          pen.applications.push({
            date: entry.date,
            dosage: dosageAmount,
          });
          pen.totalUsed += dosageAmount;
          pen.lastApplication = entry.date;
        }
      }
    });
    
    const activePens = Array.from(pens.values()).filter(pen => pen.totalUsed < pen.totalCapacity);
    
    if (activePens.length === 0) return null;
    
    // Get the most recent active pen
    const recentPen = activePens.sort((a, b) => b.lastApplication.getTime() - a.lastApplication.getTime())[0];
    
    if (!recentPen.applications || recentPen.applications.length < 2) return null;
    
    // Calculate average interval between applications
    const intervals: number[] = [];
    for (let i = 1; i < recentPen.applications.length; i++) {
      const diff = recentPen.applications[i].date.getTime() - recentPen.applications[i-1].date.getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // days
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return addDays(recentPen.lastApplication, Math.round(avgInterval));
  };

  const calculateStats = () => {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        currentWeight: 0,
        startWeight: 0,
        totalLoss: 0,
        averageLoss: 0,
        currentDosage: '',
        progressPercent: 0,
        totalCost: 0,
      };
    }

    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const startWeight = sortedEntries[0].weight;
    const currentWeight = sortedEntries[sortedEntries.length - 1].weight;
    const totalLoss = startWeight - currentWeight;
    const averageLoss = totalLoss / entries.length;
    const currentDosage = sortedEntries[sortedEntries.length - 1].dosage;
    const totalCost = entries.reduce((sum, entry) => sum + (entry.penCost || 0), 0);
    
    // Use goal settings if available, otherwise fall back to 10% rule
    const targetWeight = goalSettings?.targetWeight || startWeight * 0.9;
    const targetLoss = startWeight - targetWeight;
    const progressPercent = targetLoss > 0 ? Math.min((totalLoss / targetLoss) * 100, 100) : 0;

    console.log('Stats calculated:', { 
      startWeight, 
      currentWeight, 
      totalLoss, 
      averageLoss, 
      progressPercent 
    });

    return {
      totalEntries: entries.length,
      currentWeight,
      startWeight,
      totalLoss,
      averageLoss,
      currentDosage,
      progressPercent: Math.max(0, progressPercent),
      totalCost,
      targetWeight,
    };
  };

  const stats = calculateStats();
  const nextApplicationDate = getNextApplicationDate();

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = "text-health-primary" 
  }: { 
    title: string; 
    value: string; 
    icon: any; 
    color?: string; 
  }) => (
    <Card className="transition-all duration-300 hover:shadow-md hover:scale-105">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color} opacity-80`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Celkem záznamů"
          value={stats.totalEntries.toString()}
          icon={Calendar}
          color="text-health-secondary"
        />
        
        <StatCard
          title="Aktuální hmotnost"
          value={`${stats.currentWeight.toFixed(1)} kg`}
          icon={Target}
          color="text-health-primary"
        />
        
        <StatCard
          title="Celková ztráta"
          value={`${stats.totalLoss > 0 ? '-' : '+'}${Math.abs(stats.totalLoss).toFixed(1)} kg`}
          icon={TrendingDown}
          color={stats.totalLoss > 0 ? "text-health-primary" : "text-health-accent"}
        />
        
        <StatCard
          title="Aktuální dávka"
          value={stats.currentDosage || '-'}
          icon={Syringe}
          color="text-health-secondary"
        />

        <StatCard
          title="Další aplikace"
          value={nextApplicationDate ? format(nextApplicationDate, 'd.M.yyyy', { locale: cs }) : 'Neznámo'}
          icon={Clock}
          color="text-health-accent"
        />
      </div>

      {stats.totalCost > 0 && (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Celkové náklady na pera</p>
                <p className="text-2xl font-bold text-health-accent">{stats.totalCost.toLocaleString()} Kč</p>
                <p className="text-xs text-muted-foreground">
                  Průměr na záznam: {(stats.totalCost / stats.totalEntries).toLocaleString()} Kč
                </p>
              </div>
              <Euro className="h-8 w-8 text-health-accent opacity-80" />
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length > 0 && (
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-health-primary">
              <Target className="h-5 w-5" />
              Pokrok k cíli {goalSettings ? '(vlastní cíl)' : '(10% ztráta hmotnosti)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Počáteční: {stats.startWeight.toFixed(1)} kg</span>
              <span>Cíl: {(stats.targetWeight || 0).toFixed(1)} kg</span>
            </div>
            
            <Progress 
              value={stats.progressPercent} 
              className="h-3"
            />
            
            <div className="text-center">
              <span className="text-lg font-semibold text-health-primary">
                {stats.progressPercent.toFixed(1)}% splněno
              </span>
              {stats.progressPercent >= 100 && (
                <div className="text-sm text-health-primary font-medium mt-1">
                  🎉 Gratulujeme! Dosáhli jste cíle!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}