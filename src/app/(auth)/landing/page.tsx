'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Building2, Check, FileText, Users, Mail, Phone, Cpu, ShieldCheck, Star, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';


const features = [
    {
        icon: <FileText className="h-8 w-8 text-primary" />,
        title: 'Fiscal e Contábil Integrado',
        description: 'Importe XMLs, gerencie documentos fiscais e veja tudo se integrar ao seu plano de contas e relatórios, simplificando a conformidade.',
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

const planFeaturesTooltips = {
    'Lançamentos Fiscais': 'Lance e gerencie suas notas fiscais de entrada, saída e serviço.',
    'Relatórios Essenciais': 'Acesse relatórios como Balancete e DRE simplificados.',
    'Cadastros de Clientes e Produtos': 'Mantenha uma base de dados organizada para agilizar suas operações.',
    'Suporte via e-mail': 'Suporte técnico disponível através do nosso canal de e-mail.',
    'Tudo do plano Básico': 'Inclui todas as funcionalidades do plano Básico.',
    'Importação de XMLs em lote': 'Importe múltiplos arquivos XML de notas fiscais de uma só vez.',
    'Conciliação de Extrato com IA': 'Nossa IA analisa seu extrato bancário e sugere as contas contábeis correspondentes.',
    'Gerador de Descrição de Transação com IA': 'Gere descrições claras e padronizadas para seus lançamentos contábeis.',
    'Relatórios avançados': 'Acesse relatórios detalhados, com filtros e opções de exportação.',
    'Suporte prioritário via WhatsApp': 'Canal de suporte direto e rápido para resolver suas dúvidas.',
    'Tudo do plano Profissional': 'Inclui todas as funcionalidades do plano Profissional.',
    'Múltiplos Usuários e Perfis de Acesso': 'Crie diferentes perfis de usuário (admin, usuário) e gerencie permissões de acesso.',
    'Trilha de Auditoria Completa': 'Rastreie todas as ações importantes realizadas no sistema para total segurança e conformidade.',
    'Integrações via API (em breve)': 'Conecte o EscopoV3 a outras ferramentas que você já usa.',
    'Gerente de contas dedicado': 'Um especialista para te ajudar a extrair o máximo da plataforma.',
};


const plans = [
    {
        id: 'basico',
        name: 'Básico',
        price: '39',
        description: 'Para autônomos e MEIs que precisam do essencial.',
        features: [
            'Lançamentos Fiscais',
            'Relatórios Essenciais',
            'Cadastros de Clientes e Produtos',
            'Suporte via e-mail',
        ],
        cta: 'Começar com Básico',
        isFeatured: false,
    },
    {
        id: 'profissional',
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
        cta: 'Iniciar Teste Gratuito',
        isFeatured: true,
    },
    {
        id: 'empresarial',
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

const testimonials = [
    {
        quote: "Com o EscopoV3, automatizamos a importação de XMLs e a conciliação de extratos com IA, reduzindo nosso tempo de fechamento mensal em 50%. A gestão integrada do financeiro com o fiscal nos deu uma clareza sem precedentes.",
        name: "Geovani Silva",
        company: "CEO, Ágio Soluções",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=faces"
    },
    {
        quote: "O módulo de Departamento Pessoal é incrivelmente intuitivo. Conseguimos processar a folha de pagamento e as férias de forma rápida e sem erros. É a ferramenta definitiva para quem busca precisão e agilidade.",
        name: "Ana Costa",
        company: "Gerente de RH, Construtora Inova",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=faces"
    },
    {
        quote: "O suporte prioritário via WhatsApp do plano Profissional é um diferencial. Sempre que temos uma dúvida, a resposta é rápida e assertiva. Sentimos que temos um parceiro ao nosso lado.",
        name: "Carlos Mendes",
        company: "Sócio, Varejo Total",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=50&h=50&fit=crop&crop=faces"
    },
    {
        quote: "A trilha de auditoria completa nos deu a segurança que precisávamos para escalar nossa operação. Sabemos quem fez o quê e quando, o que é fundamental para nossa conformidade.",
        name: "Juliana Pereira",
        company: "CFO, Logística Express",
        avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=50&h=50&fit=crop&crop=faces"
    }
]

const faqs = [
    {
        question: "Meus dados estão seguros na plataforma?",
        answer: "Sim. A segurança dos seus dados é nossa prioridade máxima. Utilizamos criptografia de ponta a ponta (AES-256) para proteger todas as informações armazenadas e em trânsito. Nossos servidores estão em conformidade com as principais certificações de segurança do mercado."
    },
    {
        question: "Preciso instalar algum programa no meu computador?",
        answer: "Não. O EscopoV3 é uma plataforma 100% online (SaaS - Software as a Service). Você só precisa de um navegador de internet atualizado e acesso à internet para utilizar todas as funcionalidades em qualquer lugar."
    },
    {
        question: "Como funciona o teste gratuito?",
        answer: "Oferecemos um teste gratuito de 7 dias para o Plano Profissional, sem a necessidade de cadastrar um cartão de crédito. Durante esse período, você terá acesso a todas as funcionalidades para avaliar se a plataforma atende às suas necessidades. Ao final do período, você pode escolher continuar no plano ou mudar para outro."
    },
    {
        question: "Posso cancelar minha assinatura a qualquer momento?",
        answer: "Sim, você pode cancelar sua assinatura a qualquer momento, sem taxas ou multas. O acesso à plataforma permanecerá ativo até o final do seu ciclo de faturamento atual."
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
             <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className='bg-accent text-accent-foreground hover:bg-accent/90'>
                    <Link href="/login?plano=profissional">Comece a Otimizar Agora</Link>
                </Button>
                 <Button size="lg" variant="outline" asChild>
                    <Link href="#demonstracao">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Ver Demonstração
                    </Link>
                </Button>
            </div>
             <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Teste gratuito por 7 dias. Sem cartão de crédito.</span>
            </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-8">
            <div className="text-center">
                <p className="font-semibold text-muted-foreground">Utilizado por centenas de empresas inovadoras</p>
                <div className="mt-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-muted-foreground">
                    <span className="flex items-center gap-2 text-lg font-bold"><Building2 className='h-5 w-5'/> Empresa A</span>
                    <span className="flex items-center gap-2 text-lg font-bold"><Building2 className='h-5 w-5'/> Startup B</span>
                    <span className="flex items-center gap-2 text-lg font-bold"><Building2 className='h-5 w-5'/> Negócio C</span>
                    <span className="flex items-center gap-2 text-lg font-bold"><Building2 className='h-5 w-5'/> Contábil D</span>
                    <span className="flex items-center gap-2 text-lg font-bold"><Building2 className='h-5 w-5'/> Grupo E</span>
                </div>
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
                    <Card key={feature.title} className='bg-card/50 dark:bg-card/80 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl'>
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
        
        {/* Testimonials Section */}
        <section className="py-16">
             <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">O Que Nossos Clientes Dizem</h2>
                <p className="mt-2 text-lg text-muted-foreground">Confiança e resultados que falam por si.</p>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                      delay: 5000,
                    }),
                  ]}
                className="w-full mt-12"
            >
                <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="flex flex-col bg-muted/30 h-full">
                                <CardContent className="pt-6 flex-1">
                                    <div className="flex text-amber-400 mb-2">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                                    </div>
                                    <blockquote className="italic text-muted-foreground">“{testimonial.quote}”</blockquote>
                                </CardContent>
                                <CardFooter className="mt-4 flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Nossos Planos</h2>
                <p className="mt-2 text-lg text-muted-foreground">Escolha o plano que melhor se adapta às necessidades do seu negócio.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3 items-start">
                <TooltipProvider>
                {plans.map(plan => (
                    <Card key={plan.name} className={cn(
                        'flex flex-col transition-all duration-300 hover:shadow-xl',
                        plan.isFeatured ? 'border-primary ring-2 ring-primary scale-105 bg-card' : 'bg-muted/30 hover:-translate-y-1'
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
                                     <Tooltip key={feature}>
                                        <TooltipTrigger asChild>
                                            <li className="flex items-start gap-2 cursor-help">
                                                <Check className="h-5 w-5 mt-1 text-emerald-500" />
                                                <span className="text-muted-foreground border-b border-dashed border-muted-foreground/50">{feature}</span>
                                            </li>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className='max-w-xs'>{(planFeaturesTooltips as any)[feature] || 'Funcionalidade padrão'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className={cn('w-full', plan.isFeatured && 'bg-accent text-accent-foreground hover:bg-accent/90')} variant={plan.isFeatured ? 'default' : 'outline'}>
                                <Link href={`/login?plano=${plan.id}`}>{plan.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                </TooltipProvider>
            </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 max-w-3xl mx-auto">
             <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Perguntas Frequentes</h2>
                <p className="mt-2 text-lg text-muted-foreground">Tirando suas principais dúvidas sobre o EscopoV3.</p>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left text-lg hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
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