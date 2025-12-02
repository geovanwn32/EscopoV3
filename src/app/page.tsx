import Image from 'next/image';
import Link from 'next/link';
import { Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
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
  const loginBg = PlaceHolderImages.find((img) => img.id === 'login-background');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="relative hidden bg-muted lg:block">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt="EscopoV3 ERP"
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint={loginBg.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-background/10" />
        <div className="absolute bottom-8 left-8 right-8 rounded-lg bg-background/80 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold">Aumente sua produtividade.</h2>
          <p className="mt-2 text-muted-foreground">Nossa plataforma de contabilidade inteligente automatiza tarefas, otimiza processos e oferece insights valiosos para o seu negócio.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto w-[380px] max-w-[90vw] space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline">EscopoV3</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Acesse sua conta para gerenciar sua empresa
            </p>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Insira seu e-mail e senha para acessar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  defaultValue="usuario@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm text-primary/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input id="password" type="password" required defaultValue="password" />
              </div>
              <div className="space-y-2 pt-2">
                <Button asChild type="submit" className="w-full font-semibold">
                  <Link href="/dashboard">Entrar</Link>
                </Button>
                <Button variant="outline" className="w-full font-medium">
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Login com Google
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm">
            Não tem uma conta?{' '}
            <Link href="#" className="font-semibold text-primary underline-offset-4 hover:underline">
              Registre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
