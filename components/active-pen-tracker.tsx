"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Syringe, Calendar, TrendingDown, AlertTriangle } from 'lucide-react';
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

interface ActivePenTrackerProps {
  entries: WeightEntry[];
}

export function ActivePenTracker({ entries }: ActivePenTrackerProps) {
  console.log('ActivePenTracker rendered with entries:', entries);

  const getActivePens = () => {
    const pens = new Map();
    
    entries.forEach(entry => {
      if (entry.penId) {
        if (!pens.has(entry.penId)) {
          const penInfo = entry.penType ? {
            id: entry.penId,
            type: entry.penType,
            startDate: entry.date,
            totalCapacity: parseFloat(entry.penType) * 5.5, // mg celkem (4 dávky + 1.5 zlaté dávky)
            applications: [],
            totalUsed: 0,
            cost: entry.penCost || 0,
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
    
    return Array.from(pens.values())
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  };

  const activePens = getActivePens();
  const currentPens = activePens.filter(pen => pen.totalUsed < pen.totalCapacity);
  const finishedPens = activePens.filter(pen => pen.totalUsed >= pen.totalCapacity);

  if (activePens.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-health-secondary">
            <Syringe className="h-5 w-5" />
            Aktivní pera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Syringe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Zatím žádná pera</p>
              <p className="text-sm">Začněte novým perem v formuláři</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const predictNextApplication = (pen: any) => {
    if (!pen.applications || pen.applications.length < 2) return null;
    
    // Průměrný interval mezi aplikacemi
    const intervals: number[] = [];
    for (let i = 1; i < pen.applications.length; i++) {
      const diff = pen.applications[i].date.getTime() - pen.applications[i-1].date.getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // dny
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const lastDate = pen.applications[pen.applications.length - 1].date;
    
    return addDays(lastDate, Math.round(avgInterval));
  };

  const predictPenEnd = (pen: any) => {
    if (!pen.applications || pen.applications.length < 2) return null;
    
    const avgDosage = pen.totalUsed / pen.applications.length;
    const remaining = pen.totalCapacity - pen.totalUsed;
    const remainingApplications = Math.floor(remaining / avgDosage);
    
    const nextApp = predictNextApplication(pen);
    if (!nextApp || remainingApplications <= 0) return null;
    
    // Odhad kdy dojde pero (týdenní aplikace)
    return addDays(nextApp, remainingApplications * 7);
  };

  return (
    <div className="space-y-6">
      {/* Aktivní pera */}
      {currentPens.length > 0 && (
        <Card className="transition-all duration-300 hover:shadow-lg border-health-primary/20 bg-gradient-to-br from-health-primary/5 to-health-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-health-primary">
              <Syringe className="h-5 w-5" />
              Aktivní pera ({currentPens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {currentPens.map(pen => {
                const usagePercent = (pen.totalUsed / pen.totalCapacity) * 100;
                const remaining = pen.totalCapacity - pen.totalUsed;
                const isLowOnContent = usagePercent > 80;
                const nextApp = predictNextApplication(pen);
                const endDate = predictPenEnd(pen);
                
                return (
                  <div key={pen.id} className="border-2 border-health-primary/10 rounded-xl p-4 sm:p-5 space-y-4 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                    {/* Header - prominent for single active pen */}
                    <div className="text-center sm:flex sm:items-center sm:justify-between">
                      <div className="flex items-center justify-center sm:justify-start gap-3 mb-2 sm:mb-0">
                        <div className="h-3 w-3 rounded-full bg-health-primary animate-pulse"></div>
                        <Badge variant="outline" className="text-health-primary border-health-primary/30 font-medium text-sm">
                          {pen.type} pero
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          od {format(pen.startDate, 'd.M.yyyy', { locale: cs })}
                        </span>
                        {isLowOnContent && (
                          <Badge variant="destructive" className="flex items-center gap-1 animate-pulse text-sm">
                            <AlertTriangle className="h-3 w-3" />
                            Dochází!
                          </Badge>
                        )}
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="font-bold text-health-primary text-xl sm:text-2xl">
                          {pen.applications.length} aplikací
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pen.totalUsed.toFixed(1)} / {pen.totalCapacity} mg použito
                        </div>
                      </div>
                    </div>

                    {/* Progress bar - more prominent */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Obsah pera ({usagePercent.toFixed(0)}% použito)</span>
                        <span className="text-health-primary font-bold">{remaining.toFixed(1)} mg zbývá <span className="text-xs text-muted-foreground">(včetně zlaté dávky)</span></span>
                      </div>
                      <Progress 
                        value={usagePercent} 
                        className={`h-4 ${isLowOnContent ? 'bg-red-100' : 'bg-health-primary/10'}`}
                      />
                    </div>

                    {/* Info cards - larger on mobile for single pen */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="font-semibold text-blue-900 text-sm mb-1">Poslední aplikace</div>
                        <div className="text-blue-700 font-bold text-base">
                          {format(pen.lastApplication, 'd.M.yyyy', { locale: cs })}
                        </div>
                        <div className="text-health-primary font-bold text-lg">
                          {pen.applications[pen.applications.length - 1].dosage} mg
                        </div>
                      </div>
                      
                      {nextApp && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-900 flex items-center gap-1 text-sm mb-1">
                            <Calendar className="h-4 w-4" />
                            Další aplikace
                          </div>
                          <div className="text-green-700 font-bold text-base">
                            {format(nextApp, 'd.M.yyyy', { locale: cs })}
                          </div>
                        </div>
                      )}
                      
                      {endDate && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="font-semibold text-orange-900 flex items-center gap-1 text-sm mb-1">
                            <TrendingDown className="h-4 w-4" />
                            Odhad konce
                          </div>
                          <div className="text-orange-700 font-bold text-base">
                            {format(endDate, 'd.M.yyyy', { locale: cs })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cost info - more prominent */}
                    {pen.cost > 0 && (
                      <div className="pt-3 border-t border-health-primary/10 text-sm text-muted-foreground bg-gray-50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5 py-3 rounded-b-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center sm:text-left">
                          <div>Cena pera: <span className="font-bold text-base">{pen.cost.toLocaleString()} Kč</span></div>
                          <div>Náklady/aplikace: <span className="font-bold text-health-accent text-base">{(pen.cost / pen.applications.length).toFixed(0)} Kč</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dokončená pera */}
      {finishedPens.length > 0 && (
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Syringe className="h-5 w-5" />
              Dokončená pera ({finishedPens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {finishedPens.map(pen => (
                <div key={pen.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                    <Badge variant="secondary">
                      {pen.type} pero
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(pen.startDate, 'd.M.yyyy', { locale: cs })} - {format(pen.lastApplication, 'd.M.yyyy', { locale: cs })}
                    </span>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <div className="font-medium">{pen.applications.length} aplikací</div>
                    <div className="text-muted-foreground">{pen.totalUsed.toFixed(1)} mg použito</div>
                    {pen.cost > 0 && (
                      <>
                        <div className="text-health-accent font-medium">
                          {(pen.cost / pen.applications.length).toFixed(0)} Kč/aplikace
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(pen.cost / pen.totalUsed).toFixed(0)} Kč/mg
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}