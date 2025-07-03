"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { differenceInWeeks, format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface WeightEntry {
  date: Date;
  weight: number;
  dosage: string;
}

interface ComparisonAnalysisProps {
  entries: WeightEntry[];
}

export function ComparisonAnalysis({ entries }: ComparisonAnalysisProps) {
  console.log('ComparisonAnalysis rendered with entries:', entries);

  // SURMOUNT-1 study data - weekly weight loss from 150kg baseline
  const SURMOUNT_DATA = [
    { week: 0, weight: 150 },
    { week: 4, weight: 145.3226516 },
    { week: 8, weight: 141.5001503 },
    { week: 12, weight: 138.0966377 },
    { week: 16, weight: 135.2525031 },
    { week: 20, weight: 132.8004 },
    { week: 24, weight: 130.7539739 },
    { week: 28, weight: 129.2050232 },
    { week: 32, weight: 127.8474331 },
    { week: 36, weight: 126.6041556 },
    { week: 40, weight: 125.527584 },
    { week: 44, weight: 124.6078116 },
    { week: 48, weight: 123.8215855 },
    { week: 52, weight: 123.1491647 },
  ];

  const getComparisonAnalysis = () => {
    if (entries.length < 2) return null;

    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    
    const weeksElapsed = differenceInWeeks(lastEntry.date, firstEntry.date);
    const actualWeightLoss = firstEntry.weight - lastEntry.weight;
    const actualWeightLossPercent = (actualWeightLoss / firstEntry.weight) * 100;

    console.log('Comparison analysis:', { 
      weeksElapsed, 
      actualWeightLoss, 
      actualWeightLossPercent, 
      firstWeight: firstEntry.weight 
    });

    // Find closest SURMOUNT data point
    const closestSurmountWeek = SURMOUNT_DATA.reduce((prev, curr) => 
      Math.abs(curr.week - weeksElapsed) < Math.abs(prev.week - weeksElapsed) ? curr : prev
    );

    // Scale SURMOUNT data to user's starting weight
    const scaleFactor = firstEntry.weight / 150;
    const expectedSurmountWeight = closestSurmountWeek.weight * scaleFactor;
    const expectedWeightLoss = firstEntry.weight - expectedSurmountWeight;
    const expectedWeightLossPercent = (expectedWeightLoss / firstEntry.weight) * 100;

    const weightLossDifference = actualWeightLoss - expectedWeightLoss;
    const percentDifference = actualWeightLossPercent - expectedWeightLossPercent;

    // Performance classification
    let performance: 'excellent' | 'good' | 'average' | 'below' = 'average';
    let performanceMessage = '';
    
    if (percentDifference >= 2) {
      performance = 'excellent';
      performanceMessage = 'Vynikající! Hubení probíhá rychleji než ve studii.';
    } else if (percentDifference >= 0.5) {
      performance = 'good';
      performanceMessage = 'Velmi dobře! Dosahujete lepších výsledků než průměr.';
    } else if (percentDifference >= -1) {
      performance = 'average';
      performanceMessage = 'Vaše výsledky odpovídají studii SURMOUNT-1.';
    } else {
      performance = 'below';
      performanceMessage = 'Vaše výsledky jsou pod průměrem studie SURMOUNT-1.';
    }

    return {
      weeksElapsed,
      actualWeightLoss,
      actualWeightLossPercent,
      expectedWeightLoss,
      expectedWeightLossPercent,
      weightLossDifference,
      percentDifference,
      performance,
      performanceMessage,
      expectedSurmountWeight,
      closestSurmountWeek
    };
  };

  const analysis = getComparisonAnalysis();

  if (!analysis) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-health-secondary">
            <Award className="h-5 w-5" />
            Porovnání se studií SURMOUNT-1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Přidejte alespoň 2 záznamy pro porovnání</p>
            <p className="text-sm">Analýza vašeho pokroku vs. klinická studie</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceIcon = () => {
    switch (analysis.performance) {
      case 'excellent':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'average':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'below':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPerformanceColor = () => {
    switch (analysis.performance) {
      case 'excellent': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'good': return 'bg-green-50 border-green-200 text-green-800';
      case 'average': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'below': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-health-secondary">
          <Award className="h-5 w-5" />
          Porovnání se studií SURMOUNT-1
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Performance Summary */}
        <div className={`rounded-lg p-4 border-2 ${getPerformanceColor()}`}>
          <div className="flex items-center gap-3 mb-2">
            {getPerformanceIcon()}
            <h3 className="font-semibold">Vaše výkonnost</h3>
          </div>
          <p className="text-sm font-medium">{analysis.performanceMessage}</p>
        </div>

        {/* Detailed Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Your Results */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Vaše výsledky
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Období:</span>
                <span className="font-medium">{analysis.weeksElapsed} týdnů</span>
              </div>
              <div className="flex justify-between">
                <span>Úbytek hmotnosti:</span>
                <span className="font-medium text-green-600">
                  -{analysis.actualWeightLoss.toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span>Úbytek v %:</span>
                <span className="font-medium text-green-600">
                  -{analysis.actualWeightLossPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* SURMOUNT-3 Expected */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              SURMOUNT-1 očekávání
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Týden studie:</span>
                <span className="font-medium">{analysis.closestSurmountWeek.week}</span>
              </div>
              <div className="flex justify-between">
                <span>Očekávaný úbytek:</span>
                <span className="font-medium text-amber-600">
                  -{analysis.expectedWeightLoss.toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span>Očekávaný úbytek v %:</span>
                <span className="font-medium text-amber-600">
                  -{analysis.expectedWeightLossPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Difference Analysis */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-3">Rozdíl oproti studii</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between items-center">
              <span>Rozdíl v kg:</span>
              <div className="flex items-center gap-1">
                {analysis.weightLossDifference >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-medium ${
                  analysis.weightLossDifference >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.weightLossDifference >= 0 ? '+' : ''}{analysis.weightLossDifference.toFixed(1)} kg
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Rozdíl v %:</span>
              <div className="flex items-center gap-1">
                {analysis.percentDifference >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-medium ${
                  analysis.percentDifference >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.percentDifference >= 0 ? '+' : ''}{analysis.percentDifference.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Context */}
        <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded">
          <p><strong>O studii SURMOUNT-1:</strong> Klinická studie testující účinnost tirzepatidu na úbytku hmotnosti. 
          Výsledky jsou orientační a individuální reakce se může lišit.</p>
        </div>

      </CardContent>
    </Card>
  );
}