
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipagem para os dados do formulário
type FormInputs = {
  fullname?: string;
  email: string;
  password: string;
  remember?: boolean;
};

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

export default function LoginForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    setIsLoading(true);
    console.log(data); // Em um app real, aqui você faria a chamada para a API
    setTimeout(() => {
        setIsLoading(false);
        router.push('/selecionar-empresa');
    }, 1000);
  };

  return (
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">{isSignUp ? "Criar Conta" : "Login"}</h1>
            <p className="text-balance text-muted-foreground">
            {isSignUp ? "Insira seus dados para criar sua conta" : "Insira seu email para acessar sua conta"}
            </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="fullname">Nome Completo</Label>
              <Input id="fullname" type="text" {...register("fullname", { required: true })} placeholder="Seu nome completo" />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email", { required: true })} placeholder="email@exemplo.com" />
          </div>
          <div className="grid gap-2">
             <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                {!isSignUp && (
                    <a href="#" className="ml-auto inline-block text-sm underline">
                        Esqueceu sua senha?
                    </a>
                )}
             </div>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} {...register("password", { required: true, minLength: 6 })} placeholder="Sua senha" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Criar minha conta' : 'Entrar'}
          </Button>

            <Button variant="outline" className="w-full" disabled={isLoading}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Login com Google
            </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {isSignUp ? 'Já tem uma conta?' : "Não tem uma conta?"}{' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline" disabled={isLoading}>
            {isSignUp ? 'Entrar' : 'Crie uma agora'}
          </button>
        </div>
      </div>
  );
}

