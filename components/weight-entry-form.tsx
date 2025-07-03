"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Scale, Syringe, Euro, Plus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

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

interface WeightEntryFormProps {
  onEntryAdded: (entry: WeightEntry) => void;
  goalSettings?: GoalSettings;
  onGoalUpdate?: (goal: GoalSettings) => void;
  entries: WeightEntry[];
}

export function WeightEntryForm({ onEntryAdded, goalSettings, onGoalUpdate, entries }: WeightEntryFormProps) {
  const [date, setDate] = useState<Date | undefined>(() => {
    // Get last entry date if available, otherwise current date
    if (entries.length > 0) {
      const lastEntry = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      return lastEntry.date;
    }
    return new Date();
  });
  const [weight, setWeight] = useState('');
  const [dosage, setDosage] = useState('');
  const [customDosage, setCustomDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [penCost, setPenCost] = useState('');
  const [penType, setPenType] = useState('');
  const [isNewPen, setIsNewPen] = useState(false);
  const [selectedPenId, setSelectedPenId] = useState('');
  const [showCustomDosage, setShowCustomDosage] = useState(false);
  const [targetWeight, setTargetWeight] = useState(goalSettings?.targetWeight?.toString() || '');
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [savedCustomDosages, setSavedCustomDosages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mounjaro-custom-dosages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Get active pens
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
        }
      }
    });
    
    return Array.from(pens.values())
      .filter(pen => pen.totalUsed < pen.totalCapacity)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  };

  const activePens = getActivePens();

  console.log('WeightEntryForm rendered', { date, weight, dosage, activePens });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { date, weight, dosage, notes });
    
    if (!date || !weight || (!dosage && !customDosage)) {
      toast.error('Vyplňte prosím všechna povinná pole');
      return;
    }

    const finalDosage = showCustomDosage ? `${customDosage}mg` : dosage;
    const dosageAmount = showCustomDosage ? parseFloat(customDosage) : parseFloat(finalDosage);

    // CRITICAL SAFETY CHECK: Maximum dosage limit
    if (dosageAmount > 15) {
      toast.error(
        '⚠️ VAROVÁNÍ: Maximální dovolená dávka je 15mg! Překračování může být nebezpečné. Tuto dávku nelze zadat.', 
        { duration: 6000 }
      );
      return;
    }

    // Check if selected pen has enough content - warn but allow entry
    let penWillBeFinished = false;
    if (selectedPenId && !isNewPen) {
      const selectedPen = activePens.find(p => p.id === selectedPenId);
      if (selectedPen) {
        const remaining = selectedPen.totalCapacity - selectedPen.totalUsed;
        if (dosageAmount > remaining) {
          penWillBeFinished = true;
          toast.warning(`Dávka ${dosageAmount}mg překračuje zbývající obsah pera (${remaining.toFixed(1)}mg). Pero bude ukončeno.`);
        }
      }
    }

    // Generate pen ID if new pen
    const penId = isNewPen && penType ? 
      `pen_${Date.now()}_${penType}` : 
      selectedPenId || undefined;

    const entry: WeightEntry = {
      date,
      weight: parseFloat(weight),
      dosage: finalDosage,
      notes: notes || undefined,
      penCost: penCost ? parseFloat(penCost) : undefined,
      penType: (isNewPen && penType) ? penType : undefined,
      penId,
      isNewPen: isNewPen || undefined,
    };

    console.log('Adding entry:', entry);
    onEntryAdded(entry);
    
    // Reset form
    setWeight('');
    setDosage('');
    setCustomDosage('');
    setNotes('');
    setPenCost('');
    setPenType('');
    setIsNewPen(false);
    setSelectedPenId('');
    setShowCustomDosage(false);
    
    if (penWillBeFinished) {
      toast.success('Záznam byl přidán. Pero bylo ukončeno!');
    } else {
      toast.success('Záznam byl úspěšně přidán!');
    }
  };

  const saveCustomDosage = () => {
    if (customDosage && !savedCustomDosages.includes(customDosage)) {
      const updated = [...savedCustomDosages, customDosage].sort((a, b) => parseFloat(a) - parseFloat(b));
      setSavedCustomDosages(updated);
      localStorage.setItem('mounjaro-custom-dosages', JSON.stringify(updated));
      toast.success('Vlastní dávka byla uložena!');
      
      // Automatically return to normal mode
      setShowCustomDosage(false);
      setDosage(`${customDosage}mg`);
      setCustomDosage('');
    }
  };

  const handleGoalUpdate = () => {
    if (targetWeight && onGoalUpdate) {
      const currentWeight = goalSettings?.startWeight || parseFloat(weight) || 0;
      onGoalUpdate({
        targetWeight: parseFloat(targetWeight),
        startWeight: currentWeight,
      });
      setShowGoalSettings(false);
      toast.success('Cíl byl nastaven!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Goal Settings */}
      <Card className="border-health-primary/20 bg-health-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-health-primary">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Cílová hmotnost
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGoalSettings(!showGoalSettings)}
            >
              {showGoalSettings ? 'Skrýt' : 'Nastavit'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showGoalSettings && (
          <CardContent className="pt-0">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="targetWeight">Cílová hmotnost (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="65.0"
                />
              </div>
              <Button onClick={handleGoalUpdate} className="bg-health-primary hover:bg-health-primary/90">
                Uložit cíl
              </Button>
            </div>
            {goalSettings && (
              <div className="mt-3 text-sm text-muted-foreground">
                Aktuální cíl: <span className="font-medium text-health-primary">{goalSettings.targetWeight} kg</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-health-primary">
            <Scale className="h-5 w-5" />
            Nový záznam
          </CardTitle>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP', { locale: cs }) : 'Vyberte datum'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Hmotnost (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75.5"
                className="text-lg font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage" className="flex items-center gap-1">
                <Syringe className="h-4 w-4" />
                Dávka Mounjaro
              </Label>
              
              {!showCustomDosage ? (
                <div className="space-y-2">
                  <Select value={dosage} onValueChange={setDosage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte dávku" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.5mg">2,5 mg</SelectItem>
                      <SelectItem value="5mg">5 mg</SelectItem>
                      <SelectItem value="7.5mg">7,5 mg</SelectItem>
                      <SelectItem value="10mg">10 mg</SelectItem>
                      <SelectItem value="12.5mg">12,5 mg</SelectItem>
                      <SelectItem value="15mg">15 mg</SelectItem>
                      
                      {/* Saved custom dosages */}
                      {savedCustomDosages.map(customDose => (
                        <SelectItem key={customDose} value={`${customDose}mg`}>
                          {customDose} mg (vlastní)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomDosage(true)}
                    className="w-full text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Vlastní dávka
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.25"
                      value={customDosage}
                      onChange={(e) => setCustomDosage(e.target.value)}
                      placeholder="3.25"
                      className="flex-1"
                    />
                    <span className="flex items-center px-3 text-sm text-muted-foreground">mg</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={saveCustomDosage}
                      disabled={!customDosage || savedCustomDosages.includes(customDosage)}
                      className="flex-1 text-xs"
                    >
                      Uložit jako novou
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomDosage(false);
                        setCustomDosage('');
                      }}
                      className="flex-1 text-xs"
                    >
                      Zpět
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isNewPen" 
                  checked={isNewPen}
                  onCheckedChange={(checked) => {
                    setIsNewPen(!!checked);
                    if (checked) {
                      setSelectedPenId('');
                    } else {
                      setPenType('');
                      setPenCost('');
                    }
                  }}
                />
                <Label 
                  htmlFor="isNewPen" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Začínám nové pero
                </Label>
              </div>

              {isNewPen ? (
                <div className="space-y-2">
                  <Label htmlFor="penType" className="flex items-center gap-1">
                    <Syringe className="h-4 w-4" />
                    Typ nového pera
                  </Label>
                  <Select value={penType} onValueChange={setPenType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte typ pera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.5mg">2,5 mg pero</SelectItem>
                      <SelectItem value="5mg">5 mg pero</SelectItem>
                      <SelectItem value="7.5mg">7,5 mg pero</SelectItem>
                      <SelectItem value="10mg">10 mg pero</SelectItem>
                      <SelectItem value="12.5mg">12,5 mg pero</SelectItem>
                      <SelectItem value="15mg">15 mg pero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : activePens.length > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="activePen" className="flex items-center gap-1">
                    <Syringe className="h-4 w-4" />
                    Pokračovat s perem
                  </Label>
                  <Select value={selectedPenId} onValueChange={setSelectedPenId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte aktivní pero" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePens.map(pen => {
                        const remaining = pen.totalCapacity - pen.totalUsed;
                        const applicationsCount = pen.applications.length;
                        return (
                          <SelectItem key={pen.id} value={pen.id}>
                            {pen.type} pero - {remaining.toFixed(1)}mg zbývá ({applicationsCount} aplikací)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {selectedPenId && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                      {(() => {
                        const selectedPen = activePens.find(p => p.id === selectedPenId);
                        if (!selectedPen) return null;
                        
                        const remaining = selectedPen.totalCapacity - selectedPen.totalUsed;
                        const currentDosage = dosage ? parseFloat(dosage) : 0;
                        const willRemain = remaining - currentDosage;
                        
                        return (
                          <div className="space-y-1">
                            <div className="font-medium text-blue-800">
                              Stav pera po této aplikaci:
                            </div>
                            <div className="text-blue-700">
                              Zbývá: {Math.max(0, willRemain).toFixed(1)} mg 
                              {willRemain <= 0 && <span className="text-red-600 font-medium"> (pero bude prázdné!)</span>}
                            </div>
                            <div className="text-blue-600 text-xs">
                              Aplikací celkem: {selectedPen.applications.length + 1}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4" />
                    <span className="font-medium">Žádná aktivní pera</span>
                  </div>
                  <p className="mt-1">Zaškrtněte "Začínám nové pero" pro přidání nového pera.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isNewPen && (
              <div className="space-y-2">
                <Label htmlFor="penCost" className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  Náklady na nové pero (Kč)
                </Label>
                <Input
                  id="penCost"
                  type="number"
                  step="1"
                  value={penCost}
                  onChange={(e) => setPenCost(e.target.value)}
                  placeholder="2500"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Poznámky (volitelné)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jak se cítíte, vedlejší účinky..."
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-health-primary hover:bg-health-primary/90">
            <Scale className="mr-2 h-4 w-4" />
            Přidat záznam
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}