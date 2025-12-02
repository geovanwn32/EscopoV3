import { Building2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';

const navLinks = [
  { href: "#conheca", label: "Conheça-me" },
  { href: "#planos", label: "Planos" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">EscopoV3</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-foreground/60 transition-colors hover:text-foreground/80">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center space-x-2 mb-8">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold">EscopoV3</span>
            </Link>
            <div className="flex flex-col space-y-3">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-foreground/80 hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add a search bar here if needed */}
          </div>
          <nav className="flex items-center">
            <Button asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 sm:py-28 lg:py-36 animated-gradient">
          <div className="container text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl font-headline">
              Gestão Contábil Inteligente e Simplificada
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              O EscopoV3 é a solução definitiva para contadores, MEIs e pequenas empresas que buscam eficiência, precisão e controle total.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/login?mode=signup">Comece Agora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#planos">Ver Planos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Placeholder Sections */}
        <section id="conheca" className="py-16 sm:py-24 bg-secondary">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight">Conheça-me</h2>
            <p className="mt-4 text-muted-foreground">Apresentação institucional ou pessoal.</p>
          </div>
        </section>

        <section id="planos" className="py-16 sm:py-24">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight">Planos e Preços</h2>
            <p className="mt-4 text-muted-foreground">Informações sobre opções de planos, serviços e valores.</p>
          </div>
        </section>
        
        <section id="sobre" className="py-16 sm:py-24 bg-secondary">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight">Sobre o EscopoV3</h2>
            <p className="mt-4 text-muted-foreground">Descrição detalhada sobre a empresa, profissional ou produto.</p>
          </div>
        </section>

        <section id="contato" className="py-16 sm:py-24">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight">Contato</h2>
            <p className="mt-4 text-muted-foreground">Formas de comunicação (formulário, telefone, e-mail, redes sociais).</p>
          </div>
        </section>

      </main>
      
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} EscopoV3. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
