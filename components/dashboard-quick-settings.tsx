"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, Target } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

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

interface DashboardQuickSettingsProps {
  entries: WeightEntry[];
  goalSettings?: GoalSettings;
  onGoalUpdate: (goal: GoalSettings) => void;
}

export function DashboardQuickSettings({ entries, goalSettings, onGoalUpdate }: DashboardQuickSettingsProps) {
  const [targetWeight, setTargetWeight] = useState(goalSettings?.targetWeight?.toString() || '');
  const [nextApplicationDate, setNextApplicationDate] = useState<Date | undefined>();

  console.log('DashboardQuickSettings rendered', { entries, goalSettings });

  const handleGoalUpdate = () => {
    if (targetWeight) {
      const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
      const startWeight = sortedEntries.length > 0 ? sortedEntries[0].weight : parseFloat(targetWeight) + 10;
      
      onGoalUpdate({
        targetWeight: parseFloat(targetWeight),
        startWeight,
      });
      toast.success('Cíl byl nastaven!');
    }
  };

  const saveNextApplication = () => {
    if (nextApplicationDate) {
      localStorage.setItem('mounjaro-next-application', nextApplicationDate.toISOString());
      toast.success('Další aplikace byla naplánována!');
    }
  };

  const getNextApplicationFromStorage = () => {
    try {
      const saved = localStorage.getItem('mounjaro-next-application');
      return saved ? new Date(saved) : null;
    } catch {
      return null;
    }
  };

  const savedNextApp = getNextApplicationFromStorage();

  return (
    <Card className="border-health-primary/20 bg-gradient-to-br from-health-primary/5 to-health-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-health-primary">
          <Target className="h-5 w-5" />
          Rychlé nastavení
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cílová hmotnost */}
          <div className="space-y-3">
            <Label htmlFor="quickTargetWeight" className="text-sm font-medium">
              Cílová hmotnost (kg)
            </Label>
            <div className="flex gap-2">
              <Input
                id="quickTargetWeight"
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="65.0"
                className="flex-1"
              />
              <Button 
                onClick={handleGoalUpdate} 
                size="sm"
                className="bg-health-primary hover:bg-health-primary/90"
                disabled={!targetWeight}
              >
                Nastavit
              </Button>
            </div>
            {goalSettings && (
              <div className="text-xs text-muted-foreground">
                Aktuální cíl: <span className="font-medium text-health-primary">{goalSettings.targetWeight} kg</span>
              </div>
            )}
          </div>

          {/* Další aplikace */}
          <div className="space-y-3">
            <Label htmlFor="nextApplication" className="text-sm font-medium">
              Další aplikace
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextApplicationDate ? 
                      format(nextApplicationDate, 'PPP', { locale: cs }) : 
                      'Vyberte datum'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={nextApplicationDate}
                    onSelect={setNextApplicationDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button 
                onClick={saveNextApplication}
                size="sm"
                className="bg-health-secondary hover:bg-health-secondary/90"
                disabled={!nextApplicationDate}
              >
                <Clock className="h-4 w-4" />
              </Button>
            </div>
            {savedNextApp && (
              <div className="text-xs text-muted-foreground">
                Naplánováno: <span className="font-medium text-health-secondary">
                  {format(savedNextApp, 'PPP', { locale: cs })}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}