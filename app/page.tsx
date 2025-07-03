import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Droplets, MapPin, Shield, Activity } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-green-800">
            Vinoř Apps
          </h1>
          <p className="text-xl text-green-700">
            Weather, GPS Tracking & Weight Monitor pro Vinoř
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Weather App */}
          <Card className="border-blue-200 bg-white/70 backdrop-blur hover:bg-white/80 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <Droplets className="h-6 w-6" />
                Vinoř Weather
              </CardTitle>
              <CardDescription className="text-base">
                Sledování srážek a počasí pro zahrádkáře
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Bezpečné API - klíč skrytý na serveru</span>
                </div>
                <p>• Aktuální srážky pro Vinoř</p>
                <p>• Hodinové přehledy za 24h</p>
                <p>• Automatické obnovování</p>
                <p>• Optimalizováno pro zahrádkáře</p>
              </div>
              
              <Link href="/weather">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Otevřít Weather App
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* GPS Tracker */}
          <Card className="border-green-200 bg-white/70 backdrop-blur hover:bg-white/80 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800">
                <MapPin className="h-6 w-6" />
                Apalucha GPS Tracker
              </CardTitle>
              <CardDescription className="text-base">
                Profesionální GPS sledování pro outdoor aktivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Real-time GPS tracking</p>
                <p>• Měření rychlosti a vzdálenosti</p>
                <p>• Statistiky a historie tras</p>
                <p>• Responsivní design pro mobile</p>
              </div>
              
              <div className="space-y-2">
                <Link href="/gps-tracker">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Otevřít GPS Tracker
                  </Button>
                </Link>
                <Link href="/apalucha-gps.html" target="_blank">
                  <Button variant="outline" className="w-full">
                    HTML verze (offline)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Weight Tracker */}
          <Card className="border-purple-200 bg-white/70 backdrop-blur hover:bg-white/80 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <Activity className="h-6 w-6" />
                Weight Tracker & Tirzepatid
              </CardTitle>
              <CardDescription className="text-base">
                Sledování hmotnosti a koncentrace Tirzepatidu (Mounjaro)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>Lokální úložiště - data zůstávají v prohlížeči</span>
                </div>
                <p>• Sledování dávek Tirzepatidu (datum + mg)</p>
                <p>• Graf koncentrace v plazmě (poločas 5 dní)</p>
                <p>• Kumulativní výpočet z všech dávek</p>
                <p>• Aktuální hladina léčiva</p>
              </div>
              
              <div className="space-y-2">
                <Link href="/weight-tracker">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Otevřit Weight Tracker
                  </Button>
                </Link>
                <Link href="/weight-tracker-staging">
                  <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                    Staging verze (pokročilé funkce)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Info */}
        <Card className="border-green-300 bg-green-50/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Shield className="h-5 w-5" />
              Bezpečnost a soukromí
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-700 space-y-2">
            <p>🔒 <strong>Weather App:</strong> API klíč je bezpečně uložen na serveru - není viditelný v kódu</p>
            <p>🗺️ <strong>GPS Tracker:</strong> Používá pouze lokální prohlížeč - žádná data se neukládají na servery</p>
            <p>💊 <strong>Weight Tracker:</strong> Všechna zdravotní data zůstávají pouze ve vašem prohlížeči</p>
            <p>💾 <strong>GitHub:</strong> Můžete bezpečně nahrát na GitHub - citlivé údaje jsou chráněny</p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-blue-800">Jak začít</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold">Pro Weather App:</h4>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Získejte bezplatný API klíč na <a href="https://openweathermap.org/api" target="_blank" className="underline">openweathermap.org</a></li>
                <li>Přidejte ho do souboru <code>.env.local</code></li>
                <li>Restartujte aplikaci</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold">Pro GPS Tracker:</h4>
              <p>Stačí otevřít a povolit přístup k poloze v prohlížeči</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Pro Weight Tracker:</h4>
              <p>Zadávejte dávky Tirzepatidu (datum + mg) a sledujte koncentraci v plazmě s exponenciálním rozpadem (poločas 5 dní)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
