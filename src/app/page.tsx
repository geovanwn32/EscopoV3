'use client';

import { Building2, Mail, Phone, Users, ShieldCheck, BarChart, Rocket, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navLinks = [
  { href: "#conheca-me", label: "Conheça-me" },
  { href: "#planos", label: "Planos" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-20 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold text-foreground">EscopoV3</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navLinks.map(link => (
                        <Link key={link.label} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Entrar</Link>
                    </Button>
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
                        {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>
             {isMenuOpen && (
                <div className="md:hidden bg-background border-t">
                    <nav className="flex flex-col items-center gap-4 p-4">
                        {navLinks.map(link => (
                            <Link key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-muted-foreground transition-colors hover:text-foreground">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}

function HeroSection() {
    return (
        <section id="conheca-me" className="w-full py-20 sm:py-28 lg:py-36 bg-secondary/50">
            <div className="container text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                    Gestão Contábil Inteligente e Simplificada
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                    O EscopoV3 é a solução definitiva para contadores, MEIs e pequenas empresas que buscam eficiência, precisão e controle total.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="#planos">Comece Agora</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="#planos">Ver Planos</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const features = [
        {
            icon: <Rocket className="h-8 w-8" />,
            title: "Gestão Fiscal Completa",
            description: "Importe XMLs, emita notas, apure impostos e mantenha-se em dia com todas as obrigações fiscais sem complicação.",
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: "Departamento Pessoal Simplificado",
            description: "Calcule folha de pagamento, férias, rescisões e 13º com agilidade e segurança, tudo integrado em um único módulo.",
        },
        {
            icon: <BarChart className="h-8 w-8" />,
            title: "Financeiro e Contábil Integrado",
            description: "Controle contas a pagar/receber, fluxo de caixa e gere relatórios contábeis como DRE e balancetes automaticamente.",
        }
    ];

    return (
        <section id="features" className="w-full py-16 sm:py-24">
            <div className="container text-center">
                 <h2 className="text-3xl font-bold tracking-tight">Tudo que você precisa em um só lugar</h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">De lançamentos fiscais a relatórios financeiros, nossa plataforma centraliza todas as suas necessidades contábeis com ferramentas poderosas e intuitivas.</p>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex flex-col items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {feature.icon}
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PlansSection() {
    const plans = [
        {
            name: "Básico (MEI)",
            price: "49",
            description: "O essencial para o microempreendedor individual se manter em dia.",
            features: ["Módulo Fiscal Simplificado", "Emissão de NFS-e", "Controle Financeiro", "Relatórios para MEI"],
            popular: false,
        },
        {
            name: "Profissional",
            price: "99",
            description: "Para pequenas empresas e contadores que precisam de mais poder.",
            features: ["Todos os recursos do Básico", "Módulo Contábil Completo", "Departamento Pessoal (até 5 func.)", "Importação de Extrato com IA", "Suporte Prioritário"],
            popular: true,
        },
        {
            name: "Empresa",
            price: "149",
            description: "A solução completa para escritórios contábeis e empresas em crescimento.",
            features: ["Todos os recursos do Profissional", "Multi-empresa", "Usuários Ilimitados", "API para Integrações", "Gerente de Conta Dedicado"],
            popular: false,
        }
    ];
    return (
        <section id="planos" className="w-full py-16 sm:py-24 bg-secondary/50">
            <div className="container">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Planos flexíveis para cada necessidade</h2>
                    <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Escolha o plano que melhor se adapta ao tamanho e complexidade da sua operação. Cancele quando quiser.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {plans.map(plan => (
                        <Card key={plan.name} className={cn("flex flex-col", plan.popular && "border-primary ring-2 ring-primary")}>
                            {plan.popular && <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">Mais Popular</div>}
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold">R$ {plan.price}</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-primary" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                                    Começar com o {plan.name.split(' ')[0]}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AboutSection() {
    return (
        <section id="sobre" className="w-full py-16 sm:py-24">
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                    <h2 className="text-3xl font-bold tracking-tight">Sobre o EscopoV3</h2>
                    <p className="mt-6 text-lg text-muted-foreground">
                        Nascemos da necessidade de criar uma ferramenta verdadeiramente integrada e intuitiva para o mercado contábil brasileiro. Nossa missão é empoderar contadores e empresários com tecnologia de ponta, transformando tarefas complexas em processos simples e automatizados.
                    </p>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Acreditamos que, com a ferramenta certa, a gestão contábil deixa de ser uma obrigação e se torna uma poderosa aliada estratégica para o crescimento de qualquer negócio.
                    </p>
                </div>
                <div className="order-1 md:order-2">
                     <Image
                        src="https://picsum.photos/seed/teamwork/600/400"
                        alt="Equipe colaborando em um escritório"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-lg"
                        data-ai-hint="trabalho em equipe"
                    />
                </div>
            </div>
        </section>
    )
}

function ContactSection() {
    return (
        <section id="contato" className="w-full py-16 sm:py-24 bg-secondary/50">
            <div className="container">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Entre em Contato</h2>
                    <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Tem alguma dúvida ou gostaria de uma demonstração? Nossa equipe está pronta para ajudar.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
                    <div className="space-y-8">
                        <div className="flex gap-4 items-start">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Email</h3>
                                <p className="text-muted-foreground">Nossa equipe de suporte responderá em até 24 horas.</p>
                                <a href="mailto:contato@escopov3.com" className="text-primary font-medium hover:underline">contato@escopov3.com</a>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Telefone</h3>
                                <p className="text-muted-foreground">Disponível de segunda a sexta, das 9h às 18h.</p>
                                <a href="tel:+5511999998888" className="text-primary font-medium hover:underline">(11) 99999-8888</a>
                            </div>
                        </div>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Envie uma Mensagem</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1"><Label htmlFor="name">Nome</Label><Input id="name" /></div>
                                <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" /></div>
                            </div>
                            <div className="space-y-1"><Label htmlFor="message">Mensagem</Label><Textarea id="message" rows={4} /></div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Enviar Mensagem</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="w-full border-t">
            <div className="container flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} EscopoV3. Todos os direitos reservados.</p>
                <div className="flex gap-4">
                    {/* Placeholder for social icons */}
                    <Link href="#" className="text-muted-foreground hover:text-foreground"><span className="sr-only">Facebook</span>FB</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground"><span className="sr-only">Twitter</span>TW</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground"><span className="sr-only">LinkedIn</span>LI</Link>
                </div>
            </div>
        </footer>
    );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PlansSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
