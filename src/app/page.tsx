'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center animated-gradient p-4">
      <div className="flex flex-col items-center justify-center gap-10 w-full max-w-md">
        
        <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Building2 className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-headline">EscopoV3</h1>
            </div>
            <p className='text-foreground/80 max-w-md'>
              Sua contabilidade ganha vida. Organizada, atualizada e sempre segura.
            </p>
        </div>
      
        <div className="w-full">
            <Card className='shadow-xl'>
              <CardHeader>
                <CardTitle className="text-2xl">{isLogin ? 'Login' : 'Cadastro'}</CardTitle>
                <CardDescription>
                    {isLogin ? 'Insira seu e-mail e senha para acessar.' : 'Preencha os dados para criar sua conta.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" required />
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
                    <Input id="password" type="password" required />
                </div>
                
                {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input id="confirmPassword" type="password" required />
                    </div>
                )}
                
                <div className="space-y-4 pt-2">
                    <Button asChild type="submit" className="w-full font-semibold">
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

                    <Button variant="outline" className="w-full font-medium">
                      <GoogleIcon className="mr-2 h-5 w-5" />
                      Login com Google
                    </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
                <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {isLogin ? "Registre-se" : "Faça login"}
                </button>
            </div>
        </div>

        <div className="text-center">
            <h3 className='font-semibold text-foreground mb-4'>Precisa de Ajuda?</h3>
            <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm'>
              <a href='tel:+5562998554529' className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'>
                <Phone className='h-4 w-4'/> +55 (62) 99855-4529
              </a>
              <a href='mailto:geovaniwn@gmail.com' className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'>
                <Mail className='h-4 w-4'/> geovaniwn@gmail.com
              </a>
              <a href='https://wa.me/5562992127752' target='_blank' rel='noopener noreferrer' className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'>
                <Phone className='h-4 w-4'/> WhatsApp
              </a>
            </div>
        </div>

      </div>
    </div>
  )
}
