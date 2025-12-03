
'use client';
import { Building2 } from 'lucide-react';
import LoginForm from './login-form';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(p => p.id === 'login-background');
  
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
           />
         )}
         <div className="absolute inset-0 bg-zinc-900/60" />
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
       <div className="flex items-center justify-center py-12 px-4 sm:px-0 login-gradient">
          <LoginForm />
      </div>
    </div>
  );
}

