
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Mail, Lock, Eye, EyeOff, GraduationCap, Facebook, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.639,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    )
}

function DataBlocksAnimation() {
    const [isClient, setIsClient] = useState(false);
  
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    if (!isClient) {
      return null;
    }
  
    return (
        <div className="absolute top-0 left-0 right-0 bottom-0 data-block-container" aria-hidden="true">
            {[...Array(15)].map((_, i) => (
                <div 
                    key={i} 
                    className="data-block" 
                    style={{ 
                        left: `${Math.random() * 100}%`,
                        height: `${Math.random() * 200 + 50}px`,
                        animationDuration: `${Math.random() * 5 + 3}s`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const characterImage = PlaceHolderImages.find(p => p.id === 'login-character');


  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 animated-gradient">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full mx-auto bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Panel */}
        <div className="relative hidden lg:flex flex-col justify-between items-center p-12 bg-primary text-primary-foreground text-center">
            <DataBlocksAnimation />
            <div className="absolute top-12 left-12 flex items-center gap-3 z-10">
                <Building2 className="h-8 w-8" />
                <h1 className="text-2xl font-bold">EscopoV3</h1>
            </div>
            <div className='my-auto z-10'>
                 <h2 className="text-3xl font-bold mb-4">Bem-vindo ao EscopoV3.</h2>
                 <div className="text-primary-foreground/80 max-w-lg mx-auto text-left text-sm">
                    Seu sistema profissional de gestão contábil, desenvolvido para atender contadores, empresas e MEIs com eficiência, precisão e segurança. Acesse rapidamente as principais funcionalidades:
                    <br/><br/>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Lançamento de notas fiscais</li>
                        <li>Apuração de folha de pagamento</li>
                        <li>Cálculo automático de impostos</li>
                        <li>Módulo Financeiro completo</li>
                        <li>Contas a receber e contas a pagar</li>
                        <li>Relatórios específicos para MEI</li>
                    </ul>
                    <br/>
                    Organize sua rotina, acompanhe indicadores e mantenha a contabilidade sempre em dia. Utilize o menu principal para navegar entre os módulos e otimizar suas operações.
                </div>
            </div>
             <p className='text-sm text-primary-foreground/60 z-10'>© 2025 EscopoV3. Todos os direitos reservados.</p>
        </div>

        {/* Right Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">

                <h2 className="text-3xl font-bold mb-2">{isSignUp ? "Criar Conta" : "Login"}</h2>
                <p className="text-muted-foreground mb-8">{isSignUp ? "Insira seus dados para começar." : "Insira seus dados para acessar o sistema."}</p>

                <form className="space-y-4">
                    {isSignUp && (
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Nome Completo:</Label>
                            <Input id="fullname" type="text" placeholder="Seu nome completo" required className="bg-muted/50 border-0" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email:</Label>
                        <Input id="email" type="email" placeholder="email@exemplo.com" required className="bg-muted/50 border-0" />
                    </div>
                    <div className="space-y-2 relative">
                        <Label htmlFor="password">Senha:</Label>
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="Sua senha" required className="bg-muted/50 border-0 pr-10" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 bottom-2.5 text-muted-foreground"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2">
                        <div className='flex items-center'>
                           {isSignUp ? (
                             <div className="flex items-start">
                                <Checkbox id="terms" />
                                <Label htmlFor="terms" className="ml-2 font-normal text-muted-foreground text-xs">
                                    Envie-me ofertas especiais e dicas de aprendizado.
                                </Label>
                             </div>
                           ) : (
                             <>
                                <Checkbox id="remember" />
                                <Label htmlFor="remember" className="ml-2 font-normal text-muted-foreground">Lembrar-me</Label>
                             </>
                           )}
                        </div>
                        {!isSignUp && (
                             <Link href="#" className="font-medium text-primary hover:underline">
                                Esqueceu sua senha?
                            </Link>
                        )}
                    </div>
                    
                    <Button asChild type="submit" className="w-full font-semibold text-lg py-6 mt-6">
                        <Link href="/selecionar-empresa">{isSignUp ? 'Continuar' : 'Entrar'}</Link>
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">Ou continue com</span></div>
                </div>

                <div className="flex justify-center">
                    <Button variant="outline" className="gap-2 bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-100 dark:bg-card-foreground/5 dark:border-border dark:text-foreground dark:hover:bg-card-foreground/10 transition-colors">
                        <GoogleIcon/>
                        Login com Google
                    </Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-8">
                    {isSignUp ? 'Já tem uma conta?' : "Não tem uma conta?"}{' '}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
                        {isSignUp ? 'Entrar' : 'Crie uma agora'}
                    </button>
                </p>
                
                 <div className="border-t mt-8 pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">Precisa de Ajuda?</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="ghost" asChild className='text-muted-foreground hover:text-primary'>
                            <a href="https://wa.me/5562998554529" target="_blank" rel="noopener noreferrer" aria-label="Entrar em contato via WhatsApp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </a>
                        </Button>
                         <Button variant="ghost" asChild className='text-muted-foreground hover:text-primary'>
                            <a href="mailto:geovaniwn@gmail.com" aria-label="Enviar email para o suporte">
                                <Mail className="h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

