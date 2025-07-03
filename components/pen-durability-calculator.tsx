"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Syringe, Calculator, TrendingUp } from 'lucide-react';

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

interface PenDurabilityCalculatorProps {
  entries: WeightEntry[];
}

export function PenDurabilityCalculator({ entries }: PenDurabilityCalculatorProps) {
  console.log('PenDurabilityCalculator rendered with entries:', entries);

  const calculatePenDurability = (penType: string, appliedDosage: string) => {
    // Každé pero má standardně 4 dávky + 1 zlatá dávka = 5 dávek celkem
    const penStrength = parseFloat(penType);
    const totalPenContent = penStrength * 5; // mg celkem v peru
    
    const appliedDosageNum = parseFloat(appliedDosage);
    const totalApplications = Math.floor(totalPenContent / appliedDosageNum);
    
    console.log('Pen calculation:', { penType, penStrength, totalPenContent, appliedDosage, appliedDosageNum, totalApplications });
    
    return {
      totalApplications,
      weeksOfUse: totalApplications, // Předpokládáme aplikaci 1x týdně
      daysOfUse: totalApplications * 7,
      costPerApplication: 0, // Bude vypočítáno později pokud je dostupná cena
    };
  };

  const getLatestPenInfo = () => {
    const entriesWithPen = entries.filter(entry => entry.penType && entry.dosage);
    if (entriesWithPen.length === 0) return null;
    
    const latest = entriesWithPen[entriesWithPen.length - 1];
    const durability = calculatePenDurability(latest.penType!, latest.dosage);
    
    return {
      entry: latest,
      durability,
      costPerApplication: latest.penCost ? latest.penCost / durability.totalApplications : 0,
    };
  };

  const getUniquePenCombinations = () => {
    const combinations = new Map();
    
    entries.forEach(entry => {
      if (entry.penType && entry.dosage) {
        const key = `${entry.penType}-${entry.dosage}`;
        const durability = calculatePenDurability(entry.penType, entry.dosage);
        
        if (!combinations.has(key)) {
          combinations.set(key, {
            penType: entry.penType,
            dosage: entry.dosage,
            durability,
            costs: entry.penCost ? [entry.penCost] : [],
            count: 1,
          });
        } else {
          const existing = combinations.get(key);
          existing.count += 1;
          if (entry.penCost) {
            existing.costs.push(entry.penCost);
          }
        }
      }
    });
    
    return Array.from(combinations.values()).map(combo => ({
      ...combo,
      averageCost: combo.costs.length > 0 ? combo.costs.reduce((a, b) => a + b, 0) / combo.costs.length : 0,
      costPerApplication: combo.costs.length > 0 ? 
        (combo.costs.reduce((a, b) => a + b, 0) / combo.costs.length) / combo.durability.totalApplications : 0,
    }));
  };

  const latestPen = getLatestPenInfo();
  const allCombinations = getUniquePenCombinations();

  if (entries.length === 0 || allCombinations.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-health-secondary">
            <Clock className="h-5 w-5" />
            Výdrž pera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Syringe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Zatím žádné záznamy s typem pera</p>
              <p className="text-sm">Přidejte záznam s typem pera pro výpočet výdrže</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aktuální pero */}
      {latestPen && (
        <Card className="transition-all duration-300 hover:shadow-lg border-health-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-health-primary">
              <Clock className="h-5 w-5" />
              Aktuální pero - výdrž
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-health-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-health-primary">
                  {latestPen.durability.totalApplications}
                </div>
                <div className="text-sm text-muted-foreground">aplikací celkem</div>
                <div className="text-xs text-health-secondary mt-1">
                  {latestPen.entry.penType} → {latestPen.entry.dosage} dávky
                </div>
              </div>
              
              <div className="text-center p-4 bg-health-secondary/5 rounded-lg">
                <div className="text-2xl font-bold text-health-secondary">
                  {latestPen.durability.weeksOfUse}
                </div>
                <div className="text-sm text-muted-foreground">týdnů při 1x týdně</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ({latestPen.durability.daysOfUse} dní)
                </div>
              </div>
              
              {latestPen.costPerApplication > 0 && (
                <div className="text-center p-4 bg-health-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-health-accent">
                    {latestPen.costPerApplication.toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Kč za aplikaci</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    při ceně {latestPen.entry.penCost?.toLocaleString()} Kč
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Přehled všech kombinací */}
      {allCombinations.length > 1 && (
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-health-secondary">
              <Calculator className="h-5 w-5" />
              Porovnání výdrže per ({allCombinations.length} kombinací)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allCombinations.map((combo, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-health-primary border-health-primary/30">
                        {combo.penType} pero
                      </Badge>
                      <Badge variant="outline" className="text-health-secondary border-health-secondary/30">
                        {combo.dosage} dávka
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {combo.count}× použito
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-health-primary">
                        {combo.durability.totalApplications} aplikací
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {combo.durability.weeksOfUse} týdnů
                      </div>
                    </div>
                    
                    {combo.averageCost > 0 && (
                      <div className="text-center">
                        <div className="font-medium text-health-accent">
                          {combo.costPerApplication.toFixed(0)} Kč/aplikace
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ⌀ {combo.averageCost.toLocaleString()} Kč
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <div className="flex items-center gap-2 font-medium mb-1">
                <TrendingUp className="h-4 w-4" />
                Tip pro úsporu
              </div>
              <p>
                Menší aplikované dávky z vyšších per jsou často ekonomičtější. 
                Například z 15mg pera aplikovat 7,5mg dávky vám dá 10 aplikací místo standardních 5.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}