
import { Building2, Menu, BarChart, Package, Users, Mail, Phone, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const navLinks = [
  { href: "#features", label: "Recursos" },
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
        
        <section className="py-20 sm:py-28 lg:py-36 bg-secondary/50">
          <div className="container grid lg:grid-cols-2 lg:items-center gap-12">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl font-headline">
                  Gestão Contábil Inteligente e Simplificada
                </h1>
                <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-muted-foreground">
                  O EscopoV3 é a solução definitiva para contadores, MEIs e pequenas empresas que buscam eficiência, precisão e controle total.
                </p>
                <div className="mt-8 flex justify-center lg:justify-start gap-4">
                  <Button size="lg" asChild>
                    <Link href="/login">Comece Agora</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#planos">Ver Planos</Link>
                  </Button>
                </div>
              </div>
               <div className="relative hidden lg:block h-80">
                   <Image 
                    src="https://picsum.photos/seed/desk/600/400" 
                    alt="Escritório moderno"
                    fill
                    className="object-cover rounded-2xl shadow-lg"
                    data-ai-hint="modern office"
                  />
               </div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-24">
            <div className="container text-center">
                <h2 className="text-3xl font-bold tracking-tight">Tudo que você precisa em um só lugar</h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                    De lançamentos fiscais a relatórios financeiros, nossa plataforma centraliza todas as suas necessidades contábeis com ferramentas poderosas e intuitivas.
                </p>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <Card className="text-left">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <Package className="h-6 w-6" />
                            </div>
                            <CardTitle>Gestão Fiscal Completa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Importe XMLs, emita notas, apure impostos e mantenha-se em dia com todas as obrigações fiscais sem complicação.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-left">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <CardTitle>Departamento Pessoal Simplificado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Calcule folha de pagamento, férias, rescisões e 13º com agilidade e segurança, tudo integrado em um único módulo.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-left">
                        <CardHeader>
                             <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <BarChart className="h-6 w-6" />
                            </div>
                            <CardTitle>Financeiro e Contábil Integrado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Controle contas a pagar/receber, fluxo de caixa e gere relatórios contábeis como DRE e balancetes automaticamente.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section id="planos" className="py-16 sm:py-24 bg-secondary/50">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight">Planos flexíveis para cada necessidade</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Escolha o plano que melhor se adapta ao tamanho e complexidade da sua operação. Cancele quando quiser.</p>
            <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
                
                <Card className="text-left flex flex-col">
                     <CardHeader>
                        <CardTitle>Básico (MEI)</CardTitle>
                        <CardDescription>O essencial para o microempreendedor individual se manter em dia.</CardDescription>
                        <p className="text-4xl font-bold pt-4">R$ 49<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Módulo Fiscal Simplificado</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Emissão de NFS-e</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Controle Financeiro</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Relatórios para MEI</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant={'outline'}>Começar com o Básico</Button>
                    </CardFooter>
                </Card>

                <Card className={'text-left flex flex-col border-primary shadow-xl'}>
                     <CardHeader>
                        <CardTitle className='flex justify-between items-center'>
                            <span>Profissional</span>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">Mais Popular</span>
                        </CardTitle>
                        <CardDescription>Para pequenas empresas e contadores que precisam de mais poder.</CardDescription>
                        <p className="text-4xl font-bold pt-4">R$ 99<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Todos os recursos do Básico</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Módulo Contábil Completo</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Departamento Pessoal (até 5 func.)</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Importação de Extrato com IA</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Suporte Prioritário</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant={'default'}>Começar com o Profissional</Button>
                    </CardFooter>
                </Card>

                <Card className="text-left flex flex-col">
                     <CardHeader>
                        <CardTitle>Empresa</CardTitle>
                        <CardDescription>A solução completa para escritórios contábeis e empresas em crescimento.</CardDescription>
                        <p className="text-4xl font-bold pt-4">R$ 149<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Todos os recursos do Profissional</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Multi-empresa</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Usuários Ilimitados</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> API para Integrações</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Gerente de Conta Dedicado</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant={'outline'}>Começar com o Empresa</Button>
                    </CardFooter>
                </Card>

            </div>
          </div>
        </section>
        
        <section id="sobre" className="py-16 sm:py-24">
          <div className="container grid md:grid-cols-2 gap-12 items-center">
             <div className="relative h-96">
                   <Image 
                    src="https://picsum.photos/seed/team/600/400" 
                    alt="Equipe trabalhando"
                    fill
                    className="object-cover rounded-2xl shadow-lg"
                    data-ai-hint="team working"
                  />
               </div>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Criado por especialistas, para especialistas</h2>
                <p className="mt-4 text-lg text-muted-foreground">O EscopoV3 nasceu da necessidade de contadores e empresários que buscavam uma ferramenta que unisse poder, simplicidade e um design intuitivo. Nossa missão é eliminar a complexidade da gestão contábil, permitindo que você foque no que realmente importa: o crescimento do seu negócio.</p>
                 <Button variant="link" className="p-0 mt-4 text-lg">
                    <Link href="#">
                        Saiba mais sobre nossa história <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="contato" className="py-16 sm:py-24 bg-secondary/50">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight">Entre em Contato</h2>
                <p className="mt-4 text-muted-foreground">Tem alguma dúvida ou gostaria de uma demonstração? Nossa equipe está pronta para ajudar.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 mt-12 items-start">
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Email</h3>
                            <p className="text-muted-foreground">Nossa equipe de suporte responderá em até 24 horas.</p>
                            <a href="mailto:contato@escopov3.com" className="text-primary font-medium hover:underline">contato@escopov3.com</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Telefone</h3>
                            <p className="text-muted-foreground">Disponível de segunda a sexta, das 9h às 18h.</p>
                            <p className="font-medium text-foreground">(11) 99999-8888</p>
                        </div>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Envie uma Mensagem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Input placeholder="Seu nome" />
                        </div>
                        <div className="space-y-2">
                           <Input type="email" placeholder="Seu e-mail" />
                        </div>
                        <div className="space-y-2">
                           <Textarea placeholder="Sua mensagem" />
                        </div>
                        <Button className="w-full">Enviar Mensagem</Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

      </main>
      
      <footer className="py-6 md:py-8 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} EscopoV3. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

    