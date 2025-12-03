
'use client';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Loader2, Clock, Mail, Phone, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function PendingPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();

    useEffect(() => {
        // If for some reason the user lands here but is not logged in,
        // send them back to the login page.
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleLogout = async () => {
        await auth.signOut();
        sessionStorage.clear();
        localStorage.removeItem('currentCompany');
        router.push('/login');
    };

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
                        Sua solicitação de acesso foi enviada e está aguardando a liberação do administrador do sistema.
                        Você será notificado por e-mail assim que seu acesso for aprovado.
                    </p>
                    <p className="text-muted-foreground">
                        Se precisar de assistência imediata, entre em contato através dos canais abaixo:
                    </p>
                     <div className="flex items-center justify-center gap-6 pt-4">
                        <a href="https://wa.me/5562998554529" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <Phone className="h-5 w-5" />
                            <span>WhatsApp</span>
                        </a>
                        <a href="mailto:geovanisilvadeoliveira447@gmail.com" className="flex items-center gap-2 text-primary hover:underline">
                            <Mail className="h-5 w-5" />
                            <span>Email</span>
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

