"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Scale, Syringe, StickyNote, Trash2, Euro } from 'lucide-react';
import { format } from 'date-fns';
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

interface EntriesListProps {
  entries: WeightEntry[];
  onDeleteEntry: (index: number) => void;
}

export function EntriesList({ entries, onDeleteEntry }: EntriesListProps) {
  console.log('EntriesList rendered with entries:', entries);

  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getDosageColor = (dosage: string) => {
    const dosageNum = parseFloat(dosage);
    if (dosageNum <= 2.5) return 'bg-green-100 text-green-800';
    if (dosageNum <= 7.5) return 'bg-yellow-100 text-yellow-800';
    if (dosageNum <= 12.5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-health-secondary">
          <Calendar className="h-5 w-5" />
          Historie záznamů ({entries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Zatím žádné záznamy</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedEntries.map((entry, index) => {
              const originalIndex = entries.findIndex(e => 
                e.date.getTime() === entry.date.getTime() && 
                e.weight === entry.weight &&
                e.dosage === entry.dosage
              );
              
              return (
                <div 
                  key={`${entry.date.getTime()}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(entry.date, 'PPP', { locale: cs })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-health-primary" />
                        <span className="text-lg font-bold text-health-primary">
                          {entry.weight} kg
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-health-secondary" />
                        <Badge className={getDosageColor(entry.dosage)}>
                          {entry.dosage}
                        </Badge>
                      </div>

                      {entry.penCost && (
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-health-accent" />
                          <span className="font-medium text-health-accent">
                            {entry.penCost.toLocaleString()} Kč
                          </span>
                        </div>
                      )}

                      {entry.penType && (
                        <div className="flex items-center gap-2">
                          <Syringe className="h-4 w-4 text-purple-600" />
                          <Badge variant="outline" className="text-purple-600 border-purple-600/30">
                            {entry.penType} pero
                            {entry.isNewPen && <span className="ml-1 text-xs">(nové)</span>}
                          </Badge>
                        </div>
                      )}
                      
                      {entry.penId && !entry.penType && (() => {
                        // Check if this pen is still active
                        const pens = new Map();
                        entries.forEach(e => {
                          if (e.penId) {
                            if (!pens.has(e.penId)) {
                              const penInfo = e.penType ? {
                                id: e.penId,
                                type: e.penType,
                                totalCapacity: parseFloat(e.penType) * 5.5,
                                totalUsed: 0,
                              } : null;
                              if (penInfo) pens.set(e.penId, penInfo);
                            }
                            if (pens.has(e.penId)) {
                              const pen = pens.get(e.penId);
                              pen.totalUsed += parseFloat(e.dosage);
                            }
                          }
                        });
                        
                        const pen = pens.get(entry.penId);
                        const isActive = pen && pen.totalUsed < pen.totalCapacity;
                        
                        return (
                          <div className="flex items-center gap-2">
                            <Syringe className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                            <Badge variant="outline" className={isActive ? 'text-blue-600 border-blue-600/30' : 'text-gray-500 border-gray-300'}>
                              {isActive ? 'Aktivní pero' : 'Dokončené pero'}
                            </Badge>
                            {!isActive && pen && pen.totalUsed > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {pen.cost > 0 && (
                                  <span>{(pen.cost / pen.totalUsed).toFixed(0)} Kč/mg</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    
                    {entry.notes && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <StickyNote className="h-4 w-4 mt-0.5" />
                        <span>{entry.notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('Deleting entry at index:', originalIndex);
                      onDeleteEntry(originalIndex);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}