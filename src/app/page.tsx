
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v2.4h3.97c-.16 1.03-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42s1.95-4.42 4.34-4.42c1.36 0 2.27.58 2.79 1.08l1.9-1.83C15.47 4.73 13.52 4 11.02 4 6.7 4 3.22 7.22 3.22 11.5s3.48 7.5 7.8 7.5c4.42 0 7.42-2.99 7.42-7.65 0-.5-.05-1-.12-1.48H12.48z"></path></svg>
    )
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 login-gradient">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full mx-auto bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Panel */}
        <div className="relative hidden lg:flex flex-col justify-between items-center p-12 bg-primary/95 text-primary-foreground text-center">
            <div className="absolute inset-0 bg-primary opacity-20 transform -skew-y-6"></div>
            <div className="relative z-10 w-full">
                <div className="flex items-center justify-center gap-3 mb-6 text-left">
                    <Building2 className="h-8 w-8 text-white" />
                    <h1 className="text-2xl font-bold text-white">EscopoV3</h1>
                </div>
                <h2 className="text-4xl font-bold mb-4 text-left">Sua plataforma completa de gestão contábil.</h2>
            </div>
             <div className="relative z-10 text-left w-full">
                <p className="text-sm text-primary-foreground/80">&copy; 2025 EscopoV3. Todos os direitos reservados.</p>
            </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
                <div className="flex items-center gap-3 mb-6 lg:hidden">
                    <Building2 className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">EscopoV3</h1>
                </div>

                <h2 className="text-3xl font-bold mb-2">{isSignUp ? "Crie uma Conta" : "Login"}</h2>
                <p className="text-muted-foreground mb-8">{isSignUp ? "Insira seus dados para começar." : "Insira seus dados para acessar o sistema."}</p>

                <form className="space-y-4">
                    {isSignUp && (
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Nome Completo:</Label>
                            <Input id="fullname" type="text" placeholder="Seu nome completo" required className="bg-muted border-0" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email:</Label>
                        <Input id="email" type="email" placeholder="email@exemplo.com" required className="bg-muted border-0" />
                    </div>
                    <div className="space-y-2 relative">
                        <Label htmlFor="password">Senha:</Label>
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="Sua senha" required className="bg-muted border-0 pr-10" />
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
                            <Checkbox id="remember" />
                            <Label htmlFor="remember" className="ml-2 font-normal text-muted-foreground">Lembrar-me</Label>
                        </div>
                        {!isSignUp && (
                             <Link href="#" className="font-medium text-primary hover:underline">
                                Esqueceu sua senha?
                            </Link>
                        )}
                    </div>
                    
                    <Button asChild type="submit" className="w-full font-semibold text-lg py-6 mt-6">
                        <Link href="/selecionar-empresa">{isSignUp ? 'Criar Conta' : 'Entrar'}</Link>
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">Ou continue com</span></div>
                </div>

                <div className="flex justify-center gap-4">
                    <Button variant="outline" className="w-full">
                        <GoogleIcon className="mr-2 h-5 w-5"/>
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
                        <Button variant="outline" asChild>
                            <a href="tel:62998554529" aria-label="Ligar para o suporte">
                                <Phone className="h-4 w-4" /> <span className='ml-2 hidden sm:inline'>(62) 99855-4529</span>
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="mailto:geovaniwn@gmail.com" aria-label="Enviar email para o suporte">
                                <Mail className="h-4 w-4" /> <span className='ml-2 hidden sm:inline'>geovaniwn@gmail.com</span>
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="https://wa.me/5562998554529" target="_blank" rel="noopener noreferrer" aria-label="Entrar em contato via WhatsApp">
                                <MessageSquare className="h-4 w-4" /> <span className='ml-2 hidden sm:inline'>WhatsApp</span>
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
