'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, Activity, Syringe, TrendingUp, AlertCircle, Download, Upload, TestTube, Weight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Dose {
  id: string
  date: string
  amount: number // mg
}

interface WeightEntry {
  id: string
  date: string
  weight: number // kg
}

interface ConcentrationPoint {
  date: string
  concentration: number
  formattedDate: string
  weightMeasurement?: number
}

export default function WeightTrackerStaging() {
  const [doses, setDoses] = useState<Dose[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [newDoseDate, setNewDoseDate] = useState('')
  const [newDoseAmount, setNewDoseAmount] = useState('')
  const [newWeightDate, setNewWeightDate] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [timeRange, setTimeRange] = useState('30') // days
  const [activeTab, setActiveTab] = useState('tirzepatide')

  console.log('Weight Tracker Staging loaded', { dosesCount: doses.length, weightsCount: weights.length })

  // Load data from localStorage
  useEffect(() => {
    const savedDoses = localStorage.getItem('tirzepatide-doses-staging')
    const savedWeights = localStorage.getItem('weight-entries-staging')
    
    if (savedDoses) {
      setDoses(JSON.parse(savedDoses))
      console.log('Loaded doses from localStorage:', JSON.parse(savedDoses))
    }
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights))
      console.log('Loaded weights from localStorage:', JSON.parse(savedWeights))
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('tirzepatide-doses-staging', JSON.stringify(doses))
    console.log('Saved doses to localStorage:', doses)
  }, [doses])

  useEffect(() => {
    localStorage.setItem('weight-entries-staging', JSON.stringify(weights))
    console.log('Saved weights to localStorage:', weights)
  }, [weights])

  // Calculate concentration with half-life of 5 days
  const calculateConcentration = (doseAmount: number, doseDate: Date, currentDate: Date): number => {
    const halfLifeDays = 5
    const decayConstant = Math.log(2) / halfLifeDays // λ = ln(2) / t₁/₂
    const timeElapsed = (currentDate.getTime() - doseDate.getTime()) / (1000 * 60 * 60 * 24) // days
    
    if (timeElapsed < 0) return 0 // Future doses don't contribute
    
    return doseAmount * Math.exp(-decayConstant * timeElapsed)
  }

  // Generate concentration data for chart
  const concentrationData = useMemo(() => {
    if (doses.length === 0) return []

    const sortedDoses = [...doses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstDose = new Date(sortedDoses[0].date)
    const today = new Date()
    const daysToShow = parseInt(timeRange)
    const endDate = new Date(Math.max(today.getTime(), new Date(sortedDoses[sortedDoses.length - 1].date).getTime() + daysToShow * 24 * 60 * 60 * 1000))
    
    const data: ConcentrationPoint[] = []
    
    // Generate daily points
    for (let date = new Date(firstDose); date <= endDate; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date)
      let totalConcentration = 0
      
      // Sum concentrations from all doses
      doses.forEach(dose => {
        const doseDate = new Date(dose.date)
        totalConcentration += calculateConcentration(dose.amount, doseDate, currentDate)
      })

      // Find weight measurement for this date
      const weightForDate = weights.find(w => w.date === currentDate.toISOString().split('T')[0])
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        concentration: totalConcentration,
        formattedDate: currentDate.toLocaleDateString('cs-CZ'),
        weightMeasurement: weightForDate?.weight
      })
    }
    
    return data
  }, [doses, weights, timeRange])

  // Current concentration
  const currentConcentration = useMemo(() => {
    const today = new Date()
    let total = 0
    
    doses.forEach(dose => {
      const doseDate = new Date(dose.date)
      total += calculateConcentration(dose.amount, doseDate, today)
    })
    
    console.log('Current concentration calculated:', total)
    return total
  }, [doses])

  // Statistics
  const statistics = useMemo(() => {
    const sortedWeights = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const totalDoses = doses.reduce((sum, dose) => sum + dose.amount, 0)
    const avgDose = doses.length > 0 ? totalDoses / doses.length : 0
    
    let weightChange = 0
    if (sortedWeights.length >= 2) {
      weightChange = sortedWeights[sortedWeights.length - 1].weight - sortedWeights[0].weight
    }

    const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : 0
    
    return {
      totalDoses,
      avgDose,
      weightChange,
      currentWeight,
      dosesCount: doses.length,
      weightsCount: weights.length
    }
  }, [doses, weights])

  const addDose = () => {
    if (!newDoseDate || !newDoseAmount) {
      toast.error('Vyplňte prosím všechna pole')
      return
    }
    
    const newDose: Dose = {
      id: Date.now().toString(),
      date: newDoseDate,
      amount: parseFloat(newDoseAmount)
    }
    
    setDoses(prev => [...prev, newDose])
    setNewDoseDate('')
    setNewDoseAmount('')
    
    console.log('New dose added:', newDose)
    toast.success(`Dávka ${newDose.amount}mg přidána pro ${new Date(newDose.date).toLocaleDateString('cs-CZ')}`)
  }

  const addWeight = () => {
    if (!newWeightDate || !newWeight) {
      toast.error('Vyplňte prosím všechna pole')
      return
    }
    
    const newWeightEntry: WeightEntry = {
      id: Date.now().toString(),
      date: newWeightDate,
      weight: parseFloat(newWeight)
    }
    
    setWeights(prev => [...prev, newWeightEntry])
    setNewWeightDate('')
    setNewWeight('')
    
    console.log('New weight added:', newWeightEntry)
    toast.success(`Váha ${newWeightEntry.weight}kg zaznamenána pro ${new Date(newWeightEntry.date).toLocaleDateString('cs-CZ')}`)
  }

  const deleteDose = (id: string) => {
    setDoses(prev => prev.filter(dose => dose.id !== id))
    console.log('Dose deleted:', id)
    toast.success('Dávka smazána')
  }

  const deleteWeight = (id: string) => {
    setWeights(prev => prev.filter(weight => weight.id !== id))
    console.log('Weight deleted:', id)
    toast.success('Záznam váhy smazán')
  }

  const exportData = () => {
    const data = {
      doses,
      weights,
      exportDate: new Date().toISOString(),
      version: '2.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weight-tracker-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    console.log('Data exported:', data)
    toast.success('Data exportována do souboru')
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        
        if (importedData.doses) {
          setDoses(importedData.doses)
          console.log('Doses imported:', importedData.doses)
        }
        if (importedData.weights) {
          setWeights(importedData.weights)
          console.log('Weights imported:', importedData.weights)
        }
        
        toast.success('Data úspěšně importována')
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Chyba při importu dat')
      }
    }
    reader.readAsText(file)
  }

  const sortedDoses = [...doses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const sortedWeights = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Button variant="outline" className="mb-4">
              ← Zpět na hlavní stránku
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              STAGING VERZE
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-purple-800">
            Weight Tracker & Tirzepatid Monitor
          </h1>
          <p className="text-lg text-purple-700">
            Pokročilé sledování hmotnosti a koncentrace Tirzepatidu (Mounjaro) v plazmě
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-purple-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Aktuální koncentrace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {currentConcentration.toFixed(2)} mg
              </div>
              <p className="text-xs text-gray-600 mt-1">
                v plazmě dnes
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Weight className="h-4 w-4 text-blue-600" />
                Aktuální váha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {statistics.currentWeight > 0 ? `${statistics.currentWeight} kg` : '—'}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {statistics.weightChange !== 0 && (
                  <span className={statistics.weightChange < 0 ? 'text-green-600' : 'text-red-600'}>
                    {statistics.weightChange > 0 ? '+' : ''}{statistics.weightChange.toFixed(1)} kg celkem
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Syringe className="h-4 w-4 text-green-600" />
                Dávky ({statistics.dosesCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {statistics.totalDoses.toFixed(1)} mg
              </div>
              <p className="text-xs text-gray-600 mt-1">
                průměr: {statistics.avgDose.toFixed(1)} mg
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TestTube className="h-4 w-4 text-orange-600" />
                Záznamů váhy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">
                {statistics.weightsCount}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                měření
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <Card className="border-gray-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Activity className="h-5 w-5" />
              Správa dat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export dat
              </Button>
              <Label htmlFor="import-file" className="cursor-pointer">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Import dat
                  </span>
                </Button>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="time-range" className="text-sm">Časový rozsah:</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dní</SelectItem>
                    <SelectItem value="14">14 dní</SelectItem>
                    <SelectItem value="30">30 dní</SelectItem>
                    <SelectItem value="60">60 dní</SelectItem>
                    <SelectItem value="90">90 dní</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tirzepatide">Tirzepatid</TabsTrigger>
            <TabsTrigger value="weight">Váha</TabsTrigger>
            <TabsTrigger value="combined">Kombinované</TabsTrigger>
          </TabsList>

          {/* Tirzepatide Tab */}
          <TabsContent value="tirzepatide" className="space-y-6">
            {/* Add New Dose */}
            <Card className="border-indigo-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-800">
                  <Syringe className="h-5 w-5" />
                  Přidat novou dávku Tirzepatidu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dose-date">Datum aplikace</Label>
                    <Input
                      id="dose-date"
                      type="date"
                      value={newDoseDate}
                      onChange={(e) => setNewDoseDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dose-amount">Množství (mg)</Label>
                    <Input
                      id="dose-amount"
                      type="number"
                      placeholder="např. 2.5"
                      step="0.1"
                      min="0"
                      value={newDoseAmount}
                      onChange={(e) => setNewDoseAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={addDose} 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={!newDoseDate || !newDoseAmount}
                    >
                      Přidat dávku
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Concentration Chart */}
            <Card className="border-purple-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <TrendingUp className="h-5 w-5" />
                  Graf koncentrace Tirzepatidu v plazmě
                </CardTitle>
                <CardDescription>
                  Kumulativní koncentrace s poločasem eliminace 5 dní
                </CardDescription>
              </CardHeader>
              <CardContent>
                {concentrationData.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={concentrationData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('cs-CZ', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Koncentrace (mg)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('cs-CZ')}
                          formatter={(value: number) => [`${value.toFixed(2)} mg`, 'Koncentrace']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="concentration" 
                          stroke="#7c3aed" 
                          fill="url(#colorConcentration)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorConcentration" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Zatím nejsou žádné dávky k zobrazení</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doses History */}
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-5 w-5" />
                  Historie dávek Tirzepatidu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedDoses.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {sortedDoses.map((dose) => (
                      <div 
                        key={dose.id}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-blue-50">
                            {new Date(dose.date).toLocaleDateString('cs-CZ')}
                          </Badge>
                          <span className="font-medium">
                            {dose.amount} mg
                          </span>
                          <span className="text-sm text-gray-600">
                            (zbývá ~{calculateConcentration(dose.amount, new Date(dose.date), new Date()).toFixed(2)} mg)
                          </span>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteDose(dose.id)}
                        >
                          Smazat
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Žádné dávky zatím nebyly zaznamenány</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weight Tab */}
          <TabsContent value="weight" className="space-y-6">
            {/* Add Weight */}
            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Weight className="h-5 w-5" />
                  Přidat záznam váhy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight-date">Datum měření</Label>
                    <Input
                      id="weight-date"
                      type="date"
                      value={newWeightDate}
                      onChange={(e) => setNewWeightDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight-amount">Váha (kg)</Label>
                    <Input
                      id="weight-amount"
                      type="number"
                      placeholder="např. 85.2"
                      step="0.1"
                      min="0"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={addWeight} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!newWeightDate || !newWeight}
                    >
                      Přidat váhu
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Chart */}
            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="h-5 w-5" />
                  Graf hmotnosti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weights.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('cs-CZ', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Váha (kg)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('cs-CZ')}
                          formatter={(value: number) => [`${value} kg`, 'Váha']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Weight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Zatím nejsou žádné záznamy váhy</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weight History */}
            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Weight className="h-5 w-5" />
                  Historie váhy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedWeights.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {sortedWeights.map((weight, index) => {
                      const prevWeight = sortedWeights[index + 1]
                      const change = prevWeight ? weight.weight - prevWeight.weight : 0
                      
                      return (
                        <div 
                          key={weight.id}
                          className="flex items-center justify-between p-3 bg-white/50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50">
                              {new Date(weight.date).toLocaleDateString('cs-CZ')}
                            </Badge>
                            <span className="font-medium">
                              {weight.weight} kg
                            </span>
                            {change !== 0 && (
                              <span className={`text-sm ${change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                              </span>
                            )}
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteWeight(weight.id)}
                          >
                            Smazat
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Weight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Žádné záznamy váhy zatím nebyly přidány</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Combined Tab */}
          <TabsContent value="combined" className="space-y-6">
            <Card className="border-indigo-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-800">
                  <Activity className="h-5 w-5" />
                  Kombinovaný přehled
                </CardTitle>
                <CardDescription>
                  Korelace mezi koncentrací Tirzepatidu a změnami váhy
                </CardDescription>
              </CardHeader>
              <CardContent>
                {concentrationData.length > 0 && weights.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={concentrationData.filter(d => d.weightMeasurement)}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('cs-CZ', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('cs-CZ')}
                          formatter={(value: number, name: string) => [
                            name === 'concentration' ? `${value.toFixed(2)} mg` : `${value} kg`,
                            name === 'concentration' ? 'Koncentrace' : 'Váha'
                          ]}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="concentration" 
                          stroke="#7c3aed" 
                          strokeWidth={2}
                          dot={{ fill: '#7c3aed', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="weightMeasurement" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Potřebujete data z obou kategorií pro kombinovaný přehled</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information */}
        <Card className="border-amber-200 bg-amber-50/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Důležité informace - Staging verze
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-700 space-y-2">
            <p>🧪 <strong>Staging:</strong> Toto je testovací verze s pokročilými funkcemi</p>
            <p>📊 <strong>Výpočet koncentrace:</strong> Exponenciální rozpad s poločasem eliminace 5 dní</p>
            <p>⚖️ <strong>Sledování váhy:</strong> Korelace s aplikacemi Tirzepatidu</p>
            <p>📈 <strong>Exporty:</strong> Záloha dat ve formátu JSON</p>
            <p>💾 <strong>Oddělené úložiště:</strong> Staging data se neovlivňují s produkční verzí</p>
            <p>⚠️ <strong>Upozornění:</strong> Pouze pro informativní účely, nenahrazuje lékařský dohled</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}