'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'

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

  const featureSlides = [
    {
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      title: "Decisões Estratégicas",
      description: "Transforme números em insights valiosos para o crescimento do seu negócio. Tenha o controle total das finanças e obrigações fiscais."
    },
    {
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: "Contabilidade em Tempo Real",
      description: "Sua contabilidade ganha vida: organizada, atualizada e sempre acessível. Acesse sua empresa com poucos cliques, de qualquer lugar."
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      title: "Segurança e Confiança",
      description: "Gerencie seus dados com a tranquilidade de uma plataforma robusta e segura, projetada para proteger suas informações mais valiosas."
    }
  ]

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto w-[380px] max-w-[90vw] space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline text-primary">EscopoV3</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              {isLogin ? "Acesse sua conta para gerenciar sua empresa" : "Crie sua conta para começar"}
            </p>
          </div>
        
          <Card>
              <CardHeader>
              <CardTitle className="text-2xl">{isLogin ? 'Login' : 'Cadastro'}</CardTitle>
              <CardDescription>
                  {isLogin ? 'Insira seu e-mail e senha para acessar sua conta.' : 'Preencha os dados para criar sua conta.'}
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
                
                <div className="space-y-2 pt-2">
                    <Button asChild type="submit" className="w-full font-semibold">
                      <Link href="/dashboard">{isLogin ? 'Entrar' : 'Cadastrar'}</Link>
                    </Button>
                    <Button variant="outline" className="w-full font-medium">
                      <GoogleIcon className="mr-2 h-5 w-5" />
                      Login com Google
                    </Button>
                </div>
              </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {isLogin ? "Registre-se" : "Faça login"}
              </button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-10">
        <Carousel
          className="w-full max-w-md"
          plugins={[Autoplay({delay: 5000})]}
          opts={{loop: true}}
        >
          <CarouselContent>
            {featureSlides.map((slide, index) => (
              <CarouselItem key={index} className="text-center">
                <div className="flex flex-col items-center justify-center gap-4 p-6">
                  {slide.icon}
                  <h3 className="text-2xl font-bold text-foreground">{slide.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{slide.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}
