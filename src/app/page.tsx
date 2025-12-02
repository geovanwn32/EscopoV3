'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Lock, Eye, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
    )
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 text-foreground mb-4">
                <Building2 className="h-8 w-8" />
                <h1 className="text-3xl font-bold font-headline">EscopoV3</h1>
            </div>
            <p className="text-muted-foreground">Sua plataforma completa de gestão contábil.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? 'Login' : 'Criar Conta'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Insira seus dados para acessar o sistema.' : 'Preencha os campos para se registrar.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="E-mail" required className="pl-10" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Senha" required className="pl-10 pr-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
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

            <div className="space-y-4 pt-4">
              <Button asChild type="submit" className="w-full font-semibold text-lg py-6">
                <Link href="/selecionar-empresa">{isLogin ? 'Entrar' : 'Cadastrar'}</Link>
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
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v2.4h3.97c-.16 1.03-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42s1.95-4.42 4.34-4.42c1.36 0 2.27.58 2.79 1.08l1.9-1.83C15.47 4.73 13.52 4 11.02 4 6.7 4 3.22 7.22 3.22 11.5s3.48 7.5 7.8 7.5c4.42 0 7.42-2.99 7.42-7.65 0-.5-.05-1-.12-1.48H12.48z"></path></svg>
                Login com Google
              </Button>
            </div>

          </CardContent>
        </Card>

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

       <footer className="mt-16 text-center text-sm text-muted-foreground">
            <p className="mb-4">Precisa de Ajuda?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <a href="tel:+5562998554529" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                    (62) 99855-4529
                </a>
                <a href="mailto:geovaniwn@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    geovaniwn@gmail.com
                </a>
                <a href="https://wa.me/5562992127752" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                </a>
            </div>
             <p className="mt-8 text-xs">&copy; {new Date().getFullYear()} EscopoV3. Todos os direitos reservados.</p>
        </footer>
    </div>
  );
}
