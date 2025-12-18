import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Layout, Palette, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">SvenskaApp</div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Hem</a>
            <a href="#" className="hover:text-foreground transition-colors">Funktioner</a>
            <a href="#" className="hover:text-foreground transition-colors">Om oss</a>
          </div>
          <Button size="sm">Kom igång</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Bygg något fantastiskt idag
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Vi hjälper dig att skapa moderna, responsiva och vackra gränssnitt. 
            Allt börjar med en enkel idé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Starta Projektet <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Läs Dokumentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-amber-500" />}
              title="Blixtsnabb"
              description="Byggd för prestanda och snabba laddningstider så att dina användare aldrig behöver vänta."
            />
            <FeatureCard 
              icon={<Palette className="h-8 w-8 text-purple-500" />}
              title="Modern Design"
              description="Noggrant utvalda typsnitt och färger som ger ditt projekt en professionell känsla direkt."
            />
            <FeatureCard 
              icon={<Layout className="h-8 w-8 text-blue-500" />}
              title="Responsiv"
              description="Ser bra ut på alla enheter, från mobiler till stora skärmar, utan extra krångel."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 SvenskaApp. Alla rättigheter förbehållna.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="mb-4 p-3 bg-background rounded-full w-fit border shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}