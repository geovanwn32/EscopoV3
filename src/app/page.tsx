'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.655-3.373-11.303-8H2.894v7.757C6.243,39.636,14.465,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.836,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl grid lg:grid-cols-2 shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-primary text-primary-foreground relative">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-48 h-48 bg-primary-foreground/5 rounded-full" />
            <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-32 h-32 bg-primary-foreground/5 rounded-full" />
            
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-white">
                    <Building2 className="h-10 w-10" />
                    <h1 className="text-4xl font-bold font-headline">EscopoV3</h1>
                </div>
                <h2 className="text-3xl font-bold">Bem-vindo(a) de volta!</h2>
                <p className="text-primary-foreground/80">
                  Acesse sua conta para gerenciar sua contabilidade com eficiência e segurança.
                </p>
            </div>
        </div>
        
        {/* Right Panel */}
        <div className="p-8 sm:p-12 bg-card">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">{isLogin ? 'Login' : 'Criar Conta'}</h2>
              <p className="text-muted-foreground">
                {isLogin ? 'Insira seus dados para acessar o sistema.' : 'Preencha os campos para se registrar.'}
              </p>
            </div>

            <div className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="E-mail" required className="pl-10" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="Senha" required className="pl-10" />
                    </div>
                     {!isLogin && (
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="confirmPassword" type="password" placeholder="Confirmar Senha" required className="pl-10" />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <Label htmlFor="remember-me" className="font-normal text-muted-foreground">Lembrar-me</Label>
                    </div>
                    {isLogin && (
                    <Link href="#" className="font-medium text-primary hover:underline">
                        Esqueceu sua senha?
                    </Link>
                    )}
                </div>

                <div className="space-y-4">
                    <Button asChild type="submit" className="w-full font-semibold text-lg py-6">
                        <Link href="/dashboard">{isLogin ? 'Entrar' : 'Cadastrar'}</Link>
                    </Button>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                            Ou continue com
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full">
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Login com Google
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-medium text-primary hover:underline"
                    >
                        {isLogin ? 'Crie uma agora' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
      </Card>
    </div>
  );
}
