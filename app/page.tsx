"use client";

import { useState, useEffect } from 'react';
import { WeightEntryForm } from '@/components/weight-entry-form';
import { WeightChart } from '@/components/weight-chart';
import { EntriesList } from '@/components/entries-list';
import { StatsOverview } from '@/components/stats-overview';
import { PenDurabilityCalculator } from '@/components/pen-durability-calculator';
import { ActivePenTracker } from '@/components/active-pen-tracker';
import { ComparisonAnalysis } from '@/components/comparison-analysis';
import { UsageGuide } from '@/components/usage-guide';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Heart } from 'lucide-react';
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

export default function Home() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [goalSettings, setGoalSettings] = useState<GoalSettings | undefined>();

  console.log('App rendered with entries:', entries);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('mounjaro-entries');
    const savedGoal = localStorage.getItem('mounjaro-goal');
    
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(entriesWithDates);
        console.log('Loaded entries from localStorage:', entriesWithDates);
      } catch (error) {
        console.error('Error loading entries:', error);
        toast.error('Chyba při načítání dat');
      }
    }
    
    if (savedGoal) {
      try {
        const goalData = JSON.parse(savedGoal);
        setGoalSettings(goalData);
        console.log('Loaded goal from localStorage:', goalData);
      } catch (error) {
        console.error('Error loading goal:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('mounjaro-entries', JSON.stringify(entries));
      console.log('Saved entries to localStorage:', entries);
    }
  }, [entries]);

  // Save goal to localStorage whenever it changes
  useEffect(() => {
    if (goalSettings) {
      localStorage.setItem('mounjaro-goal', JSON.stringify(goalSettings));
      console.log('Saved goal to localStorage:', goalSettings);
    }
  }, [goalSettings]);

  const handleEntryAdded = (newEntry: WeightEntry) => {
    console.log('Adding new entry:', newEntry);
    setEntries(prev => [...prev, newEntry]);
    toast.success('Záznam byl přidán!');
  };

  const handleDeleteEntry = (index: number) => {
    console.log('Deleting entry at index:', index);
    setEntries(prev => prev.filter((_, i) => i !== index));
    toast.success('Záznam byl smazán');
  };

  const handleGoalUpdate = (newGoal: GoalSettings) => {
    console.log('Updating goal settings:', newGoal);
    setGoalSettings(newGoal);
    toast.success('Cíl byl nastaven!');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mounjaro-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data byla exportována');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const entriesWithDates = imported.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(entriesWithDates);
        toast.success('Data byla importována');
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Chyba při importu dat');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-medical-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-health-dark mb-2">
            <Heart className="inline-block mr-3 h-8 w-8 text-health-primary" />
            Mounjaro Tracker
          </h1>
          <p className="text-health-dark/70 text-lg">
            Určeno pro skupinu Kilimundžáro CZ/SK
          </p>
        </div>

        {/* Import/Export */}
        <div className="flex justify-center gap-4 mb-8">
          <Button variant="outline" onClick={exportData} disabled={entries.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportovat data
          </Button>
          <div>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
              id="import-input"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-input')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Importovat data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview entries={entries} goalSettings={goalSettings} />
        </div>

        {/* Active Pen Tracker */}
        <div className="mb-8">
          <ActivePenTracker entries={entries} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="form" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/70 backdrop-blur-sm border-2 border-white/30 shadow-lg rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="form"
              className="data-[state=active]:bg-health-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs font-medium px-1 py-2 min-h-[44px] flex items-center justify-center"
            >
              <span className="hidden sm:inline text-center">Nový záznam</span>
              <span className="sm:hidden text-center">Záznam</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chart"
              className="data-[state=active]:bg-health-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs font-medium px-1 py-2 min-h-[44px] flex items-center justify-center"
            >
              <span className="text-center">Graf</span>
            </TabsTrigger>
            <TabsTrigger 
              value="entries"
              className="data-[state=active]:bg-health-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs font-medium px-1 py-2 min-h-[44px] flex items-center justify-center"
            >
              <span className="text-center">Historie</span>
            </TabsTrigger>
            <TabsTrigger 
              value="durability"
              className="data-[state=active]:bg-health-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs font-medium px-1 py-2 min-h-[44px] flex items-center justify-center"
            >
              <span className="hidden sm:inline text-center">Výdrž per</span>
              <span className="sm:hidden text-center">Pera</span>
            </TabsTrigger>
            <TabsTrigger 
              value="compare"
              className="data-[state=active]:bg-health-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs font-medium px-1 py-2 min-h-[44px] flex items-center justify-center"
            >
              <span className="hidden sm:inline text-center">Porovnání</span>
              <span className="sm:hidden text-center">Srovnání</span>
            </TabsTrigger>
            <TabsTrigger 
              value="guide"
              className="data-[state=active]:bg-health-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs font-medium px-1 py-2 min-h-[44px] flex items-center justify-center"
            >
              <span className="hidden sm:inline text-center">Návod</span>
              <span className="sm:hidden text-center">Návod</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <WeightEntryForm 
              onEntryAdded={handleEntryAdded} 
              goalSettings={goalSettings}
              onGoalUpdate={handleGoalUpdate}
              entries={entries}
            />
          </TabsContent>

          <TabsContent value="chart" className="space-y-6">
            <WeightChart entries={entries} goalSettings={goalSettings} />
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <EntriesList entries={entries} onDeleteEntry={handleDeleteEntry} />
          </TabsContent>

          <TabsContent value="durability" className="space-y-6">
            <ActivePenTracker entries={entries} />
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <ComparisonAnalysis entries={entries} />
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <UsageGuide />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <div className="text-health-dark/50 text-sm">
            <p>💚 Vytvořeno pro podporu zdravého životního stylu</p>
          </div>
          
          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <p className="font-semibold mb-2">⚠️ Důležité upozornění:</p>
            <p>
              Tato aplikace slouží pouze pro sledování a není náhradou za lékařskou péči. 
              Nikdy neměňte dávkování bez konzultace s lékařem. Dělení dávek provádějte pouze na doporučení lékaře. 
              Při jakýchkoli problémech kontaktujte svého lékaře.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
