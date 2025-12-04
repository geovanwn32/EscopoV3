'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Rocket, Sparkles, Building2 } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';

const plansDetails = {
    basico: {
        id: 'basico',
        name: 'Básico',
        price: '39',
        features: [
            'Módulo Financeiro (Contas a Pagar/Receber)',
            'Emissão Manual de Notas (NF-e, NFS-e)',
            'Cadastros de Clientes e Produtos',
            'Suporte via e-mail',
        ],
    },
    profissional: {
        id: 'profissional',
        name: 'Profissional',
        price: '79',
        features: [
            'Tudo do plano Básico',
            'Importação de XMLs em lote',
            'Conciliação de Extrato com IA',
            'Gerador de Descrição de Transação com IA',
            'Relatórios avançados',
            'Suporte prioritário via WhatsApp',
        ],
    },
    empresarial: {
        id: 'empresarial',
        name: 'Empresarial',
        price: '149',
        features: [
            'Tudo do plano Profissional',
            'Múltiplos Usuários e Perfis de Acesso',
            'Trilha de Auditoria Completa',
            'Integrações via API (em breve)',
            'Gerente de contas dedicado',
        ],
    }
};

type PlanID = keyof typeof plansDetails;

export default function BemVindoPage() {
    const router = useRouter();
    const { currentCompany, companies } = useCompany();
    const [selectedPlanId, setSelectedPlanId] = useState<PlanID | null>(null);

    useEffect(() => {
        const planId = sessionStorage.getItem('selectedPlan');
        if (planId && (planId === 'basico' || planId === 'profissional' || planId === 'empresarial')) {
            setSelectedPlanId(planId);
        }
    }, []);

    const activeCompany = companies.find(c => c.id === currentCompany);

    const handleCheckout = () => {
        // In a real application, you would redirect to a payment provider like Stripe
        // For this demo, we'll just simulate success and go to the dashboard
        sessionStorage.removeItem('selectedPlan'); // Clear the plan after "checkout"
        router.push('/dashboard');
    }

    const handleContinue = () => {
        router.push('/dashboard');
    }

    if (!activeCompany) {
        return (
             <div className="flex h-screen w-full items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Nenhuma Empresa Selecionada</CardTitle>
                        <CardDescription>Você precisa selecionar uma empresa primeiro.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/selecionar-empresa')}>Selecionar Empresa</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (selectedPlanId) {
        const plan = plansDetails[selectedPlanId];
        return (
            <div className="flex h-screen w-full items-center justify-center p-4 animated-gradient">
                <Card className="w-full max-w-lg shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Quase lá!</CardTitle>
                        <CardDescription>
                            Você está prestes a ativar o plano <span className='font-bold text-primary'>{plan.name}</span> para a empresa <span className='font-bold'>{activeCompany.name}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="rounded-lg border bg-card p-4">
                            <h3 className="font-semibold mb-2">Resumo do Plano: {plan.name}</h3>
                             <p className="mb-4">
                                <span className="text-3xl font-bold">R$ {plan.price}</span>
                                <span className="text-sm text-muted-foreground">/mês</span>
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button className="w-full" size="lg" onClick={handleCheckout}>
                            Finalizar Assinatura
                        </Button>
                         <Button variant="link" size="sm" onClick={handleContinue}>
                            Decidir depois
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center p-4 animated-gradient">
            <Card className="w-full max-w-md text-center shadow-2xl">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Bem-vindo(a) de volta!</CardTitle>
                    <CardDescription>
                        Você está acessando a empresa <span className='font-bold'>{activeCompany.name}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Tudo pronto para organizar suas finanças e obrigações fiscais.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleContinue}>
                        <Rocket className="mr-2 h-4 w-4" />
                        Ir para o Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}