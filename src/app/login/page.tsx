
import { Building2, ArrowLeft } from 'lucide-react';
import LoginForm from './login-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
            <p className="text-lg">
              “Este sistema transformou a maneira como gerenciamos nossas finanças e obrigações fiscais. É intuitivo, poderoso e indispensável para o nosso dia a dia.”
            </p>
            <footer className="text-sm">Sofia Mendes, CEO da InovaTech</footer>
          </blockquote>
        </div>
      </div>
       <div className="flex items-center justify-center py-12 px-4 sm:px-0">
          <LoginForm />
      </div>
    </div>
  );
}
