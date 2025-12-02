
import { Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: "#", label: "Soluções" },
  { href: "#", label: "Quem somos" },
  { href: "#", label: "Blog" },
  { href: "#", label: "Suporte" },
];

function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent text-white">
      <div className="container mx-auto flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">EscopoV3</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-white/80 transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden sm:inline-flex border-white/50 text-white hover:bg-white/10 hover:text-white">
             <Link href="/login">Acessar Sistema</Link>
          </Button>
          <Search className="h-5 w-5 text-white/80 cursor-pointer" />
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
          
          {/* Coluna da Imagem */}
          <div className="relative flex items-center justify-center bg-primary">
            <Image
              src="https://picsum.photos/seed/businessman/800/1200"
              alt="Profissional de negócios sorrindo"
              width={800}
              height={1200}
              className="object-cover w-full h-full"
              data-ai-hint="homem de negócios"
            />
          </div>

          {/* Coluna do Conteúdo */}
          <div className="relative flex flex-col justify-center items-start p-8 sm:p-16 lg:p-24 bg-[hsl(240,10%,3.9%)] text-white">
             <Header />
            <div className='max-w-lg'>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                    Gestão Contábil Inteligente e Simplificada.
                </h1>
                <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-primary">
                    Sua empresa produtiva com EscopoV3
                </h2>
                <p className="mt-6 text-lg text-white/70">
                    Com projetos personalizados, nossa equipe mapeia as atividades da sua organização e modela um fluxo de automação exclusivo para cada processo.
                </p>
                <p className="mt-4 text-lg text-white/70">
                    Uma consultoria completa com treinamento, implantação e suporte!
                </p>
                <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-6 text-lg font-bold">
                    Fale com Especialista
                </Button>
            </div>
             <footer className="absolute bottom-8 text-white/50 text-sm">
                © {new Date().getFullYear()} EscopoV3. Todos os direitos reservados.
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
