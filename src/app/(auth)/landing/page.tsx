'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Building2, Check, FileText, LineChart, Users, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: <FileText className="h-8 w-8 text-primary" />,
        title: 'Emissão Simplificada',
        description: 'Emita NF-e e NFC-e com poucos cliques, através de uma interface intuitiva e com validação em tempo real.',
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: 'Gestão de Cadastros',
        description: 'Mantenha seus clientes, produtos e transportadoras organizados em um só lugar, facilitando o preenchimento das notas.',
    },
    {
        icon: <LineChart className="h-8 w-8 text-primary" />,
        title: 'Relatórios Inteligentes',
        description: 'Acompanhe suas vendas, impostos e o status de suas notas fiscais com relatórios completos e fáceis de gerar.',
    },
]

const plans = [
    {
        name: 'Básico',
        price: '39',
        description: 'Para autônomos e MEIs.',
        features: [
            '50 emissões/mês (NF-e/NFC-e)',
            'Cadastro de clientes e produtos',
            'Suporte via e-mail',
        ],
        cta: 'Assinar Agora',
        isFeatured: false,
    },
    {
        name: 'Profissional',
        price: '79',
        description: 'Ideal para pequenas empresas.',
        features: [
            'Emissões Ilimitadas',
            'Tudo do plano Básico',
            'Relatórios avançados',
            'Suporte prioritário via WhatsApp',
        ],
        cta: 'Assinar Agora',
        isFeatured: true,
    },
    {
        name: 'Empresarial',
        price: '149',
        description: 'Para negócios em escala.',
        features: [
            'Tudo do plano Profissional',
            'Múltiplos usuários',
            'Integrações via API',
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
            <Button className='bg-accent text-accent-foreground hover:bg-accent/90'>
                Comece Agora
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4">
        {/* Hero Section */}
        <section className="py-20 text-center sm:py-32">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Bem-vindo ao Sistema de
                <br />
                <span className='text-primary'>Gestão Contábil.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                Aqui você pode registrar operações, emitir documentos fiscais eletrônicos e acompanhar o status das suas notas em tempo real. Certifique-se de manter seus dados cadastrais atualizados e suas configurações fiscais corretamente definidas para garantir uma emissão segura e sem rejeições.
            </p>
             <div className="mt-8">
                <Button size="lg" className='bg-accent text-accent-foreground hover:bg-accent/90'>
                    Comece Agora
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
            <div className="mt-12 grid gap-8 md:grid-cols-3 items-center">
                {plans.map(plan => (
                    <Card key={plan.name} className={cn(
                        'flex flex-col',
                        plan.isFeatured ? 'border-accent ring-2 ring-accent scale-105 bg-card' : 'bg-card/50 dark:bg-card/80'
                    )}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-baseline">
                                <span>{plan.name}</span>
                                {plan.isFeatured && <span className="text-xs font-semibold text-accent">Ideal</span>}
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
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-emerald-500" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className={cn('w-full', plan.isFeatured && 'bg-accent text-accent-foreground hover:bg-accent/90')} variant={plan.isFeatured ? 'default' : 'outline'}>
                                {plan.cta}
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
                <Card className="p-6 flex items-center gap-4 bg-card/50 dark:bg-card/80">
                    <Phone className="h-8 w-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">WhatsApp</h3>
                        <p className="text-sm text-muted-foreground">Converse em tempo real</p>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4 bg-card/50 dark:bg-card/80">
                    <Mail className="h-8 w-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-sm text-muted-foreground">Receba uma resposta detalhada</p>
                    </div>
                </Card>
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
