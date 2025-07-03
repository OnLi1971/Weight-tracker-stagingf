"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  Scale, 
  Syringe, 
  TrendingDown, 
  Calendar, 
  Target,
  Shield,
  AlertTriangle,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

export function UsageGuide() {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const guideSteps = [
    {
      id: 'start',
      title: 'Začátek sledování',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-blue-50 border-blue-200',
      steps: [
        'Nastavte si cílovou hmotnost v sekci "Nový záznam"',
        'Při první aplikaci zaškrtněte "Začínám nové pero"',
        'Vyberte typ pera (2,5mg - 15mg) podle vašeho předpisu',
        'Zadejte náklady na pero (volitelné) pro sledování nákladů'
      ]
    },
    {
      id: 'daily',
      title: 'Pravidelné záznamy',
      icon: <Scale className="h-5 w-5" />,
      color: 'bg-green-50 border-green-200',
      steps: [
        'Zadávejte hmotnost pravidelně (doporučujeme týdně)',
        'Vyberte dávku - můžete používat vlastní dávky (např. 3,25mg)',
        'Pokračujte se stávajícím perem nebo začněte nové',
        'Přidejte poznámky o vedlejších účincích nebo pocitoch'
      ]
    },
    {
      id: 'tracking',
      title: 'Sledování pokroku',
      icon: <TrendingDown className="h-5 w-5" />,
      color: 'bg-amber-50 border-amber-200',
      steps: [
        'Prohlížejte si graf s vývojem hmotnosti',
        'Porovnejte svůj pokrok se studií SURMOUNT-1',
        'Sledujte výdrž aktivních per a náklady',
        'Exportujte data pro zálohování nebo sdílení s lékařem',
        'Importujte dříve zálohovaná data při změně zařízení'
      ]
    }
  ];

  const features = [
    {
      name: 'Sledování per',
      description: 'Automatický výpočet zbývajícího obsahu a odhad konce pera',
      icon: <Syringe className="h-4 w-4" />
    },
    {
      name: 'Graf pokroku',
      description: 'Vizualizace úbytku hmotnosti s možností porovnání se studií',
      icon: <TrendingDown className="h-4 w-4" />
    },
    {
      name: 'Vlastní dávky',
      description: 'Možnost zadávat a ukládat individuální dávky',
      icon: <Target className="h-4 w-4" />
    },
    {
      name: 'Predikce',
      description: 'Odhad dosažení cílové hmotnosti na základě dat ze studie SURMOUNT-1',
      icon: <Calendar className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Shield className="h-5 w-5" />
            Důležité upozornění
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">
                Tato aplikace slouží pouze pro sledování a není náhradou za lékařskou péči.
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Nikdy neměňte dávkování bez konzultace s lékařem</li>
                <li>Dělení dávek provádějte pouze na doporučení lékaře</li>
                <li>Při jakýchkoli problémech kontaktujte svého lékaře</li>
                <li>Aplikace neposkytuje lékařské rady ani diagnózy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-health-secondary">
            <BookOpen className="h-5 w-5" />
            Návod k použití
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {guideSteps.map((step) => (
            <Collapsible key={step.id}>
              <CollapsibleTrigger
                onClick={() => toggleSection(step.id)}
                className={`w-full p-4 rounded-lg border-2 ${step.color} hover:shadow-md transition-all duration-200 flex items-center justify-between text-left`}
              >
                <div className="flex items-center gap-3">
                  {step.icon}
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openSections.includes(step.id) ? 'rotate-180' : ''
                  }`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="pl-4 space-y-2">
                  {step.steps.map((stepText, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{stepText}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-health-primary">
            <Target className="h-5 w-5" />
            Funkce aplikace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg bg-health-primary/5 hover:bg-health-primary/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  {feature.icon}
                  <h4 className="font-semibold text-health-primary">{feature.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Guide */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Export a import dat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2 bg-white">Export dat</Badge>
              <ul className="space-y-1 list-disc list-inside text-blue-800">
                <li>Zálohování všech vašich záznamů</li>
                <li>Sdílení pokroku s lékařem</li> 
                <li>Přenos na jiné zařízení</li>
                <li>Ochrana před ztrátou dat</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2 bg-white">Import dat</Badge>
              <ul className="space-y-1 list-disc list-inside text-blue-800">
                <li>Obnovení zálohovaných dat</li>
                <li>Přenos z jiného zařízení</li>
                <li>Spojení více období sledování</li>
                <li>Pokračování v dlouhodobém sledování</li>
              </ul>
            </div>
          </div>
          <div className="bg-white p-3 rounded border text-xs text-blue-700">
            <strong>Tip:</strong> Exportujte data pravidelně (např. měsíčně) jako zálohu. 
            JSON soubor obsahuje všechny vaše záznamy a lze jej kdykoli znovu importovat.
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-health-accent/20 bg-health-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-health-accent">
            <CheckCircle className="h-5 w-5" />
            Tipy pro nejlepší výsledky
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Měření</Badge>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>Vždy se važte ve stejnou dobu (ráno nalačno)</li>
                <li>Používejte stejnou váhu</li>
                <li>Zaznamenávejte pravidelně, nejlépe týdně</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Sledování</Badge>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>Pravidelně zálohujte data (Export)</li>
                <li>Sdílejte pokrok s lékařem</li>
                <li>Sledujte trendy, ne denní výkyvy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}