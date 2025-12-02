'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 22a10 10 0 0 0 5.93-2.02" />
      <path d="M12 2a10 10 0 0 1 5.93 2.02" />
      <path d="M2 12a10 10 0 0 0 2.02 5.93" />
      <path d="M22 12a10 10 0 0 1-2.02 5.93" />
      <path d="M15.5 9.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0z" />
      <path d="M12 16c-3.866 0-7 1.6-7 4" />
      <path d="M12 16a7 7 0 0 1 5-2" />
    </svg>
  );
}


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
        {/* Fundo de Galáxia Animado */}
        <div className="absolute inset-0 z-0 opacity-50">
            <div className="stars"></div>
            <div className="stars2"></div>
            <div className="stars3"></div>
        </div>

        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-background"></div>

        <div className="relative z-20 flex min-h-screen items-center justify-center py-12">
            <div className="mx-auto w-[380px] max-w-[90vw] space-y-6">
            <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline text-primary-foreground">EscopoV3</h1>
                </div>
                <p className="text-balance text-muted-foreground">
                {isLogin ? "Acesse sua conta para gerenciar sua empresa" : "Crie sua conta para começar"}
                </p>
            </div>
            
            <Card className="bg-background/80 backdrop-blur-lg border-white/10 shadow-2xl shadow-primary/10">
                <CardHeader>
                <CardTitle className="text-2xl">{isLogin ? 'Login' : 'Cadastro'}</CardTitle>
                <CardDescription>
                    {isLogin ? 'Insira seu e-mail e senha para acessar sua conta.' : 'Preencha os dados para criar sua conta.'}
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Senha</Label>
                        {isLogin && (
                            <Link href="#" className="ml-auto inline-block text-sm text-primary/80 underline-offset-4 transition-colors hover:text-primary hover:underline">
                                Esqueceu sua senha?
                            </Link>
                        )}
                    </div>
                    <Input id="password" type="password" required className="bg-background/50"/>
                </div>
                
                {!isLogin && (
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input id="confirmPassword" type="password" required className="bg-background/50"/>
                    </div>
                )}
                
                <div className="space-y-2 pt-2">
                    <Button asChild type="submit" className="w-full font-semibold">
                    <Link href="/dashboard">{isLogin ? 'Entrar' : 'Cadastrar'}</Link>
                    </Button>
                    <Button variant="outline" className="w-full font-medium">
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Login com Google
                    </Button>
                </div>
                </CardContent>
            </Card>

            <div className="text-center text-sm">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
                <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {isLogin ? "Registre-se" : "Faça login"}
                </button>
            </div>
            </div>
        </div>
    </div>
  );
}
