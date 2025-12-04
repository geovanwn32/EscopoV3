
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Building2, Check, FileText, LineChart, Users, Mail, Phone, Cpu, Bot, ShieldCheck, Briefcase } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: <FileText className="h-8 w-8 text-primary" />,
        title: 'Fiscal e Contábil Integrado',
        description: 'Emita NF-e/NFS-e, importe XMLs e veja tudo se integrar ao seu plano de contas e relatórios, simplificando a conformidade.',
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: 'Departamento Pessoal',
        description: 'Calcule folha de pagamento, férias, 13º e rescisões com precisão e agilidade, garantindo a conformidade trabalhista.',
    },
    {
        icon: <Cpu className="h-8 w-8 text-primary" />,
        title: 'Financeiro Inteligente com IA',
        description: 'Controle o fluxo de caixa, concilie extratos e deixe a IA categorizar suas despesas e receitas automaticamente.',
    },
]

const plans = [
    {
        name: 'Básico',
        price: '39',
        description: 'Para autônomos e MEIs que precisam do essencial.',
        features: [
            'Módulo Financeiro (Contas a Pagar/Receber)',
            'Emissão Manual de Notas (NF-e, NFS-e)',
            'Cadastros de Clientes e Produtos',
            'Suporte via e-mail',
        ],
        cta: 'Assinar Agora',
        isFeatured: false,
    },
    {
        name: 'Profissional',
        price: '79',
        description: 'Para pequenas e médias empresas que buscam eficiência.',
        features: [
            'Tudo do plano Básico',
            'Importação de XMLs em lote',
            'Conciliação de Extrato com IA',
            'Gerador de Descrição de Transação com IA',
            'Relatórios avançados',
            'Suporte prioritário via WhatsApp',
        ],
        cta: 'Assinar Agora',
        isFeatured: true,
    },
    {
        name: 'Empresarial',
        price: '149',
        description: 'Para negócios que necessitam de controle e escala.',
        features: [
            'Tudo do plano Profissional',
            'Múltiplos Usuários e Perfis de Acesso',
            'Trilha de Auditoria Completa',
            'Integrações via API (em breve)',
            'Gerente de contas dedicado',
        ],
        cta: 'Entrar em Contato',
        isFeatured: false,
    }
]

export default function LandingPage() {
  return (
    <div className="w-full bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">EscopoV3</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className='bg-accent text-accent-foreground hover:bg-accent/90'>
                <Link href="/login">Comece Agora</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4">
        {/* Hero Section */}
        <section className="py-20 text-center sm:py-32">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Automatize sua Rotina Contábil com 
                <br />
                <span className='text-primary'>Inteligência Artificial.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                Do financeiro ao fiscal, automatize tarefas, ganhe precisão com nossa IA e tenha uma visão completa do seu negócio. Simplifique a complexidade, otimize seu tempo.
            </p>
             <div className="mt-8">
                <Button size="lg" asChild className='bg-accent text-accent-foreground hover:bg-accent/90'>
                    <Link href="/login">Comece Agora</Link>
                </Button>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Funcionalidades Principais</h2>
                <p className="mt-2 text-lg text-muted-foreground">Tudo o que você precisa para gerenciar suas obrigações fiscais de forma simples e eficiente.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
                {features.map(feature => (
                    <Card key={feature.title} className='bg-card/50 dark:bg-card/80'>
                        <CardHeader className="items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-2">
                                {feature.icon}
                            </div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            {feature.description}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Nossos Planos</h2>
                <p className="mt-2 text-lg text-muted-foreground">Escolha o plano que melhor se adapta às necessidades do seu negócio.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3 items-start">
                {plans.map(plan => (
                    <Card key={plan.name} className={cn(
                        'flex flex-col',
                        plan.isFeatured ? 'border-primary ring-2 ring-primary scale-105 bg-card' : 'bg-muted/30'
                    )}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-baseline">
                                <span>{plan.name}</span>
                                {plan.isFeatured && <span className="text-xs font-semibold text-primary">Ideal</span>}
                            </CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="pt-4">
                                <span className="text-4xl font-bold">R$ {plan.price}</span>
                                <span className="text-sm text-muted-foreground">/mês</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="h-5 w-5 mt-1 text-emerald-500" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className={cn('w-full', plan.isFeatured && 'bg-accent text-accent-foreground hover:bg-accent/90')} variant={plan.isFeatured ? 'default' : 'outline'}>
                                <Link href="/login">{plan.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Entre em Contato</h2>
                <p className="mt-2 text-lg text-muted-foreground">Escolha a melhor forma de falar com nossa equipe.</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
                <a href="https://wa.me/5562998554529" target="_blank" rel="noopener noreferrer" className='transition-transform hover:-translate-y-1'>
                    <Card className="p-6 flex items-center gap-4 bg-muted/30 hover:shadow-md cursor-pointer">
                        <Phone className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">WhatsApp</h3>
                            <p className="text-sm text-muted-foreground">Converse em tempo real</p>
                        </div>
                    </Card>
                </a>
                <a href="mailto:geovanisilvadeoliveira447@gmail.com" className='transition-transform hover:-translate-y-1'>
                    <Card className="p-6 flex items-center gap-4 bg-muted/30 hover:shadow-md cursor-pointer">
                        <Mail className="h-8 w-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">Email</h3>
                            <p className="text-sm text-muted-foreground">Receba uma resposta detalhada</p>
                        </div>
                    </Card>
                </a>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto max-w-7xl px-4 py-6 text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} EscopoV3. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
