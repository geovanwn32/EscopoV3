'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2, Phone, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { useAuth } from '@/firebase/provider';
import { signInWithGoogle, signUpWithEmail, signInWithEmail } from '@/firebase/auth/auth';
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '@/hooks/use-company';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface User {
    id: number;
    uid: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isMaster?: boolean;
    permissions: any;
    allowedCompanyIds: number[];
    password?: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
    creationDate?: string;
    planoId?: 'Gratuito' | 'Basico' | 'Profissional' | 'Empresarial';
    statusLicenca?: 'Ativa' | 'Inadimplente' | 'Cancelada' | 'Expirada';
}

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  remember: z.boolean().optional(),
});

const signUpSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo é obrigatório." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  planoId: z.enum(["Gratuito", "Basico", "Profissional", "Empresarial"]),
  termos: z.literal<boolean>(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos e condições." }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});


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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const { useScopedData } = useCompany();
  const [, setUsers] = useScopedData<User[]>('global-users', []);

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    const plan = searchParams.get('plano');
    if (plan) {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const signupForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", phone: "", planoId: "Basico", termos: false },
  });

  useEffect(() => {
    const plan = searchParams.get('plano') as 'Gratuito' | 'Basico' | 'Profissional' | 'Empresarial' | null;
    if (plan && ['Gratuito', 'Basico', 'Profissional', 'Empresarial'].includes(plan)) {
      signupForm.setValue('planoId', plan);
    }
  }, [searchParams, signupForm]);

  const handleLogin: SubmitHandler<z.infer<typeof loginSchema>> = async (data) => {
    setIsLoading(true);
    try {
      const persistence = data.remember ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      await signInWithEmail(auth, data.email, data.password);
      toast({
        title: "Login bem-sucedido!",
        description: "Você será redirecionado para a seleção de empresa.",
      });
      router.push('/selecionar-empresa');
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
      }
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp: SubmitHandler<z.infer<typeof signUpSchema>> = async (data) => {
    setIsLoading(true);
    try {
      const userCredential = await signUpWithEmail(auth, data.email, data.password);
      const user = userCredential.user;

      const newUser: User = {
        id: Date.now(),
        uid: user.uid,
        name: data.fullName,
        email: data.email,
        isAdmin: false,
        isMaster: false,
        permissions: {},
        allowedCompanyIds: [],
        status: 'Pendente',
        creationDate: new Date().toISOString(),
        planoId: data.planoId,
        statusLicenca: 'Ativa'
      };

      setUsers(prev => [...prev, newUser]);

      await auth.signOut();

      toast({
        title: "Solicitação de Cadastro Enviada!",
        description: "Sua conta foi criada e está pendente de aprovação por um administrador.",
      });

      router.push('/pending');

    } catch (error: any)
       {
      console.error("Signup failed:", error);
      let errorMessage = "Não foi possível criar sua conta. Por favor, tente novamente.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso. Tente fazer login ou use outro e-mail.";
      }
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithGoogle(auth);
      if (userCredential) {
        toast({
          title: "Login com Google bem-sucedido!",
          description: "Você será redirecionado em breve.",
        });
        router.push('/selecionar-perfil');
      } else {
        throw new Error('Falha no login com Google.');
      }
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      toast({
        variant: "destructive",
        title: "Falha no login com Google",
        description: error.message || "Não foi possível fazer login com o Google.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextStep = async () => {
      const isValid = await signupForm.trigger(['fullName', 'email', 'password', 'confirmPassword']);
      if (isValid) {
          setStep(2);
      }
  }

  if (isSignUp) {
    return (
      <div className="grid gap-6 w-full max-w-md">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Criar uma conta</h1>
          <p className="text-balance text-muted-foreground">
            Siga os passos para começar a usar o EscopoV3
          </p>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="w-full" />
        <Form {...signupForm}>
          <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="grid gap-4">
            <div className={cn("space-y-4", step !== 1 && "hidden")}>
                <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <Input type={showPassword ? "text" : "password"} {...field} placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="button" className="w-full" onClick={handleNextStep}>Próximo</Button>
            </div>
            
            <div className={cn("space-y-4", step !== 2 && "hidden")}>
                 <FormField
                    control={signupForm.control}
                    name="planoId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Plano Escolhido</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Gratuito">Gratuito</SelectItem>
                                <SelectItem value="Basico">Básico - R$39/mês</SelectItem>
                                <SelectItem value="Profissional">Profissional - R$79/mês</SelectItem>
                                <SelectItem value="Empresarial">Empresarial - R$149/mês</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={signupForm.control}
                    name="termos"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Eu aceito os <a href="/termos" className="underline">termos e condições</a>
                            </FormLabel>
                            <FormMessage />
                        </div>
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>Voltar</Button>
                    <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
                    </Button>
                </div>
            </div>

          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Já possui uma conta?{" "}
          <button onClick={() => setIsSignUp(false)} className="underline font-semibold" disabled={isLoading}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
            Insira seu email para acessar sua conta
            </p>
        </div>
      <Form {...loginForm}>
        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="grid gap-4">
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="nome@exemplo.com" {...field} className="pl-9" autoFocus/>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Senha</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} {...field} className="pl-9" />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={loginForm.control}
            name="remember"
            render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                    <FormControl>
                        <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Lembrar-me
                    </Label>
                </FormItem>
            )}
          />
          <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Entrar com o Google
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Não tem uma conta?{" "}
        <button onClick={() => setIsSignUp(true)} className="underline font-semibold" disabled={isLoading}>
          Crie uma agora
        </button>
      </div>
    </div>
  );
}
