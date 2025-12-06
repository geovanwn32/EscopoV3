'use client';
import { Building2, ArrowLeft, HelpCircle } from 'lucide-react';
import LoginForm from './login-form';
import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-company';
import { useMemo, useState, useEffect } from 'react';


export default function LoginPage() {
  const [loginBgId] = useLocalStorage<string>('loginBackgroundId', 'login-background-professional');
  
  // Start with the default image that the server will also use.
  const defaultBg = useMemo(() => PlaceHolderImages.find(p => p.id === 'login-background-professional'), []);
  const [loginBg, setLoginBg] = useState<ImagePlaceholder | undefined>(defaultBg);

  // This effect runs only on the client, after the initial render.
  useEffect(() => {
    // Find the image based on the ID from localStorage.
    const clientSideBg = PlaceHolderImages.find(p => p.id === loginBgId) || defaultBg;
    // Update the state if it's different from the initial state.
    if (clientSideBg?.id !== loginBg?.id) {
        setLoginBg(clientSideBg);
    }
  }, [loginBgId, defaultBg, loginBg?.id]);
  
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
         {loginBg && (
           <Image
              src={loginBg.imageUrl}
              alt={loginBg.description}
              fill
              className="absolute inset-0 object-cover"
              data-ai-hint={loginBg.imageHint}
              priority
           />
         )}
         <div className="absolute inset-0 bg-blue-950/70" />
         <div className="relative z-20 flex items-center text-2xl font-bold font-headline">
            <Building2 className="h-8 w-8 mr-3" />
            EscopoV3
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-center">
              “Com o EscopoV3, automatizamos a importação de XMLs e a conciliação de extratos com IA, reduzindo nosso tempo de fechamento mensal em 50%. A gestão integrada do financeiro com o fiscal nos deu uma clareza sem precedentes sobre o nosso fluxo de caixa. É a ferramenta definitiva para quem busca precisão e agilidade.”
            </p>
            <footer className="text-sm">Geovani Silva, CEO da Ágio Soluções</footer>
          </blockquote>
        </div>
      </div>
       <div className="relative flex flex-col items-center justify-center py-12 px-4 sm:px-0">
            <Button asChild variant="ghost" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                <Link href="/landing">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Link>
            </Button>
          <LoginForm />
           <div className="absolute bottom-6 text-center text-xs text-muted-foreground space-y-2">
                <div className='flex items-center justify-center gap-2'>
                    <HelpCircle className="h-4 w-4" />
                    <p>Precisa de ajuda? <a href="https://wa.me/5562998554529" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Contate o administrador</a>.</p>
                </div>
                <div>
                    <Link href="#" className="underline underline-offset-2">Política de Privacidade</Link>
                    {' | '}
                    <Link href="#" className="underline underline-offset-2">Termos de Serviço</Link>
                </div>
            </div>
      </div>
    </div>
  );
}