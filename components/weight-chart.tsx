"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { format, addDays, differenceInDays, subDays, subMonths } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface WeightChartProps {
  entries: WeightEntry[];
  goalSettings?: GoalSettings;
}

export function WeightChart({ entries, goalSettings }: WeightChartProps) {
  console.log('WeightChart rendered with entries:', entries);
  const [showFullMIDPrediction, setShowFullMIDPrediction] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'quarter' | 'month'>('all');

  // MID prediction data table
  const MID_PREDICTION_TABLE = [
    { week: 0, weight: 150 },
    { week: 1, weight: 148.8180298 },
    { week: 2, weight: 147.6360595 },
    { week: 3, weight: 146.4793556 },
    { week: 4, weight: 145.3226516 },
    { week: 5, weight: 144.3494539 },
    { week: 6, weight: 143.3762561 },
    { week: 7, weight: 142.4382032 },
    { week: 8, weight: 141.5001503 },
    { week: 9, weight: 140.634345 },
    { week: 10, weight: 139.7685397 },
    { week: 11, weight: 138.9325887 },
    { week: 12, weight: 138.0966377 },
    { week: 13, weight: 137.3478884 },
    { week: 14, weight: 136.5991391 },
    { week: 15, weight: 135.9258211 },
    { week: 16, weight: 135.2525031 },
    { week: 17, weight: 134.6229612 },
    { week: 18, weight: 133.9934193 },
    { week: 19, weight: 133.3969097 },
    { week: 20, weight: 132.8004 },
    { week: 21, weight: 132.2669293 },
    { week: 22, weight: 131.7334586 },
    { week: 23, weight: 131.2437163 },
    { week: 24, weight: 130.7539739 },
    { week: 25, weight: 130.3580553 },
    { week: 26, weight: 129.9621366 },
    { week: 27, weight: 129.5835799 },
    { week: 28, weight: 129.2050232 },
    { week: 29, weight: 128.8471359 },
    { week: 30, weight: 128.4892487 },
    { week: 31, weight: 128.1683409 },
    { week: 32, weight: 127.8474331 },
    { week: 33, weight: 127.5285283 },
    { week: 34, weight: 127.2096235 },
    { week: 35, weight: 126.9068896 },
    { week: 36, weight: 126.6041556 },
    { week: 37, weight: 126.3244091 },
    { week: 38, weight: 126.0446626 },
    { week: 39, weight: 125.7861233 },
    { week: 40, weight: 125.527584 },
    { week: 41, weight: 125.2886122 },
    { week: 42, weight: 125.0496405 },
    { week: 43, weight: 124.8287261 },
    { week: 44, weight: 124.6078116 },
    { week: 45, weight: 124.4035631 },
    { week: 46, weight: 124.1993146 },
    { week: 47, weight: 124.01045 },
    { week: 48, weight: 123.8215855 },
    { week: 49, weight: 123.6469234 },
    { week: 50, weight: 123.4722614 },
    { week: 51, weight: 123.3107131 },
    { week: 52, weight: 123.1491647 },
    { week: 53, weight: 122.9997264 },
    { week: 54, weight: 122.850288 },
    { week: 55, weight: 122.7120344 },
    { week: 56, weight: 122.5737807 },
    { week: 57, weight: 122.4458585 },
    { week: 58, weight: 122.3179363 },
    { week: 59, weight: 122.1995588 },
    { week: 60, weight: 122.0811813 },
    { week: 61, weight: 121.9716227 },
    { week: 62, weight: 121.8620641 },
    { week: 63, weight: 121.7606551 },
    { week: 64, weight: 121.6592461 },
    { week: 65, weight: 121.5653691 },
    { week: 66, weight: 121.471492 },
    { week: 67, weight: 121.384577 },
    { week: 68, weight: 121.2976621 },
    { week: 69, weight: 121.2171833 },
    { week: 70, weight: 121.1367045 },
    { week: 71, weight: 121.0621766 },
    { week: 72, weight: 120.9876486 }
  ];

  // MID prediction calculation
  const calculateMIDPrediction = () => {
    if (entries.length < 1 || !goalSettings) return null;
    
    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const currentWeight = sortedEntries[sortedEntries.length - 1].weight;
    
    // Find the closest starting weight in MID table (scaling factor)
    const scaleFactor = currentWeight / 150; // Scale from 150kg baseline
    
    // Find when target weight will be reached
    const targetWeightScaled = goalSettings.targetWeight / scaleFactor;
    const targetEntry = MID_PREDICTION_TABLE.find(entry => entry.weight <= targetWeightScaled);
    
    if (!targetEntry) {
      // Target not reachable within 72 weeks
      return {
        targetDate: addDays(new Date(), 72 * 7),
        daysToGoal: 72 * 7,
        weeklyLoss: (currentWeight - goalSettings.targetWeight) / 72,
        isLongTerm: true,
      };
    }
    
    console.log('MID Prediction:', { 
      currentWeight, 
      scaleFactor, 
      targetWeightScaled, 
      targetWeek: targetEntry.week 
    });
    
    return {
      targetDate: addDays(new Date(), targetEntry.week * 7),
      daysToGoal: targetEntry.week * 7,
      weeklyLoss: (currentWeight - goalSettings.targetWeight) / targetEntry.week,
      targetWeek: targetEntry.week,
    };
  };

  const prediction = calculateMIDPrediction();

  // Apply time filter
  const getFilteredEntries = () => {
    if (timeFilter === 'all') return entries;
    
    const now = new Date();
    const cutoffDate = timeFilter === 'quarter' 
      ? subMonths(now, 3)
      : subMonths(now, 1);
    
    return entries.filter(entry => entry.date >= cutoffDate);
  };

  const filteredEntries = getFilteredEntries();

  // Prepare all data points with dates for proper chronological sorting
  const allDataPoints: any[] = [];
  
  // Add real entries with actual Date objects
  const sortedEntries = [...filteredEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
  sortedEntries.forEach(entry => {
    allDataPoints.push({
      actualDate: entry.date,
      weight: entry.weight,
      dosage: entry.dosage,
      fullDate: format(entry.date, 'PPP', { locale: cs }),
      isPrediction: false,
      isFullPrediction: false,
    });
  });

  // Add MID curve from first entry (when toggle is enabled)
  if (showFullMIDPrediction && filteredEntries.length > 0) {
    const firstWeight = sortedEntries[0].weight;
    const firstEntryDate = sortedEntries[0].date;
    
    // Add full MID prediction points (all 72 weeks from first entry)
    // Start from week 0 (first entry) and calculate relative weight loss
    for (let i = 0; i <= 72; i++) {
      const currentMidEntry = MID_PREDICTION_TABLE.find(entry => entry.week === i);
      const baseMidEntry = MID_PREDICTION_TABLE.find(entry => entry.week === 0);
      
      if (currentMidEntry && baseMidEntry) {
        const predictionDate = addDays(firstEntryDate, i * 7);
        // Calculate weight relative to first entry weight
        const weightLoss = baseMidEntry.weight - currentMidEntry.weight;
        const predictedWeight = firstWeight - weightLoss;
        
        allDataPoints.push({
          actualDate: predictionDate,
          weight: predictedWeight,
          dosage: 'MID Křivka',
          fullDate: format(predictionDate, 'PPP', { locale: cs }),
          isPrediction: true,
          isFullPrediction: true,
        });
      }
    }
  }
  
  // Sort all points chronologically and format for chart
  const chartData = allDataPoints
    .sort((a, b) => a.actualDate.getTime() - b.actualDate.getTime())
    .map(point => ({
      date: format(point.actualDate, 'dd.MM'),
      weight: point.weight,
      dosage: point.dosage,
      fullDate: point.fullDate,
      isPrediction: point.isPrediction,
      isFullPrediction: point.isFullPrediction,
    }));

  const getWeightTrend = () => {
    if (entries.length < 2) return null;
    
    const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const latest = sorted[sorted.length - 1].weight;
    const previous = sorted[sorted.length - 2].weight;
    const diff = latest - previous;
    
    console.log('Weight trend calculation:', { latest, previous, diff });
    
    return {
      direction: diff < 0 ? 'down' : diff > 0 ? 'up' : 'stable',
      amount: Math.abs(diff),
    };
  };

  const trend = getWeightTrend();
  const currentWeight = entries.length > 0 ? 
    [...entries].sort((a, b) => b.date.getTime() - a.date.getTime())[0].weight : 0;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-health-secondary">
            <Activity className="h-5 w-5" />
            Průběh hmotnosti
          </span>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <Button
                variant={showFullMIDPrediction ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFullMIDPrediction(!showFullMIDPrediction)}
                className="text-xs"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
{showFullMIDPrediction ? 'Skrýt data ze studie SURMOUNT-1' : 'Zobrazit data ze studie SURMOUNT-1'}
              </Button>
            )}
            {trend && (
              <div className="flex items-center gap-2 text-sm">
                {trend.direction === 'down' ? (
                  <div className="flex items-center gap-1 text-health-primary">
                    <TrendingDown className="h-4 w-4" />
                    <span>-{trend.amount.toFixed(1)} kg</span>
                  </div>
                ) : trend.direction === 'up' ? (
                  <div className="flex items-center gap-1 text-health-accent">
                    <TrendingUp className="h-4 w-4" />
                    <span>+{trend.amount.toFixed(1)} kg</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Stabilní</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Zatím žádné záznamy</p>
              <p className="text-sm">Přidejte první záznam hmotnosti</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-health-primary">
                {currentWeight.toFixed(1)} kg
              </div>
              <div className="text-sm text-muted-foreground">Aktuální hmotnost</div>
              
              {goalSettings && (
                <div className="text-sm text-health-secondary">
                  Cíl: {goalSettings.targetWeight} kg 
                  ({(currentWeight - goalSettings.targetWeight).toFixed(1)} kg zbývá)
                </div>
              )}
              
              {prediction && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  📊 MID Predikce: Cíl dosáhnete za {Math.round(prediction.daysToGoal / 7)} týdnů
                  <br />
                  ({format(prediction.targetDate, 'PPP', { locale: cs })})
                  {prediction.isLongTerm && (
                    <div className="text-orange-600 text-xs mt-1">
                      ⚠️ Dlouhodobý cíl - může trvat více než rok
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Moje data</span>
              </div>
              {showFullMIDPrediction && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-amber-500 border-dashed border-t-2 border-amber-500"></div>
                  <span className="text-sm text-muted-foreground">Data ze studie SURMOUNT-1</span>
                </div>
              )}
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    domain={[(dataMin: number) => Math.floor(dataMin - 2), (dataMax: number) => Math.ceil(dataMax + 2)]}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        
                        // Calculate progress based on goal settings
                        let progressInfo: { percent: number; remaining: number } | null = null;
                        if (goalSettings && !data.isPrediction) {
                          const totalLoss = goalSettings.startWeight - goalSettings.targetWeight;
                          const currentLoss = goalSettings.startWeight - data.weight;
                          const progressPercent = Math.min(100, Math.max(0, (currentLoss / totalLoss) * 100));
                          const remaining = data.weight - goalSettings.targetWeight;
                          
                          progressInfo = {
                            percent: progressPercent,
                            remaining: remaining,
                          };
                        }
                        
                        return (
                          <div className="bg-card border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-medium">{data.fullDate}</p>
                            <p className={data.isFullPrediction ? "text-amber-600" : "text-health-primary"}>
                              Hmotnost: {data.weight.toFixed(1)} kg {data.isFullPrediction ? '(SURMOUNT-1)' : ''}
                            </p>
                            {!data.isPrediction && (
                              <p className="text-health-secondary text-sm">
                                Dávka: {data.dosage}
                              </p>
                            )}
                            {progressInfo && (
                              <div className="mt-2 pt-2 border-t text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Pokrok k cíli:</span>
                                  <span className="font-medium text-health-primary">{progressInfo.percent.toFixed(1)}%</span>
                                </div>
                                <div className="text-muted-foreground text-xs mt-1">
                                  Zbývá: {progressInfo.remaining.toFixed(1)} kg
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Actual weight data line */}
                  <Line 
                    type="monotone" 
                    dataKey={(entry) => !entry.isFullPrediction ? entry.weight : null}
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={(props) => {
                      const { payload } = props;
                      if (payload?.isFullPrediction) return <g />; // Empty group for prediction
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={2}
                          fill="#22c55e"
                          stroke="#22c55e"
                          strokeWidth={2}
                          opacity={1}
                        />
                      );
                    }}
                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                  
                  {/* MID Prediction line */}
                  <Line 
                    type="monotone" 
                    dataKey={(entry) => entry.isFullPrediction ? entry.weight : null}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}