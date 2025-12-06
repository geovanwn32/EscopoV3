
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Loader2, Clock, Mail, Phone, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState, Suspense } from 'react';

const plansDetails = {
    basico: { name: 'Básico', price: '39,00' },
    profissional: { name: 'Profissional', price: '79,00' },
    empresarial: { name: 'Empresarial', price: '149,00' },
    Gratuito: { name: 'Gratuito', price: '0,00' },
};
type PlanID = keyof typeof plansDetails;


function PendingPageComponent() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const searchParams = useSearchParams();

    const [selectedPlan, setSelectedPlan] = useState<{ id: PlanID; name: string; price: string; } | null>(null);

    useEffect(() => {
        // If for some reason the user lands here but is not logged in,
        // send them back to the login page.
        if (!isUserLoading && !user) {
            router.push('/login');
        }

        const planId = sessionStorage.getItem('selectedPlan') as PlanID;
        if (planId && plansDetails[planId]) {
            setSelectedPlan({ id: planId, name: plansDetails[planId].name, price: plansDetails[planId].price });
        }
        
    }, [user, isUserLoading, router]);

    const handleLogout = async () => {
        await auth.signOut();
        sessionStorage.clear();
        localStorage.removeItem('currentCompany');
        router.push('/login');
    };

    const adminPhoneNumber = "5562998554529";
    const adminEmail = "geovanisilvadeoliveira447@gmail.com";

    const generateMessageBody = () => {
        const userName = user?.displayName || user?.email || "[Informe o nome completo]";
        const userEmail = user?.email || "[Informe o e-mail completo]";
        const planName = selectedPlan?.name || "[Informe o plano desejado]";
        const planPrice = selectedPlan?.price ? `R$ ${selectedPlan.price}` : "[Informe o valor do plano]";

        return `Prezado,

Gostaria de solicitar a aprovação do meu acesso ao EscopoV3. Seguem os dados necessários para a solicitação:

Nome Completo: ${userName}
E-mail: ${userEmail}
Plano Desejado: ${planName}
Valor do Plano: ${planPrice}

Fico à disposição para quaisquer informações adicionais e agradeço antecipadamente pela atenção.

Atenciosamente,`;
    };
    
    const whatsappMessage = encodeURIComponent(generateMessageBody());
    const emailSubject = encodeURIComponent(`Solicitação de Aprovação - EscopoV3 - ${user?.email}`);
    const emailBody = encodeURIComponent(generateMessageBody());

    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${whatsappMessage}`;
    const emailUrl = `mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`;


    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 animated-gradient">
            <Card className="w-full max-w-lg text-center shadow-2xl">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                        <Clock className="h-8 w-8 text-amber-500" />
                    </div>
                    <CardTitle className="text-2xl">Acesso Pendente de Aprovação</CardTitle>
                    <CardDescription className="text-base">
                        Olá, <span className="font-bold">{user.displayName || user.email}</span>!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Sua solicitação de acesso para o{' '}
                        {selectedPlan && <span className="font-bold text-primary">{`plano ${selectedPlan.name}`}</span>}
                        {' '}foi enviada e está aguardando a liberação do administrador.
                    </p>
                    <p className="text-muted-foreground">
                       Para agilizar, envie uma mensagem com seus dados para nossa equipe:
                    </p>
                     <div className="flex items-center justify-center gap-6 pt-4">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <Phone className="h-5 w-5" />
                            <span>Solicitar via WhatsApp</span>
                        </a>
                        <a href={emailUrl} className="flex items-center gap-2 text-primary hover:underline">
                            <Mail className="h-5 w-5" />
                            <span>Solicitar via Email</span>
                        </a>
                    </div>
                     <p className='text-xs text-muted-foreground pt-6'>
                        Obrigado pela sua paciência.
                    </p>
                </CardContent>
                 <CardFooter className="flex-col gap-4">
                     <Button onClick={handleLogout} variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair (Logout)
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function PendingPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <PendingPageComponent />
        </Suspense>
    )
}
