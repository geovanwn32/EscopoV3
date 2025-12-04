'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Phone, Loader2, User as UserIcon, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignUp, initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useLocalStorage } from '@/hooks/use-company';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
    id: number;
    uid: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isMaster?: boolean;
    password?: string;
    permissions: Record<string, boolean>;
    allowedCompanyIds: number[];
    status: 'Ativo' | 'Inativo' | 'Pendente';
    creationDate?: string; // ISO string
    dataExpiracaoLicenca?: string; // ISO string
    planoId?: 'Gratuito' | 'Basico' | 'Profissional' | 'Empresarial';
}


// Tipagem para os dados do formulário
type FormInputs = {
  fullname?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  remember?: boolean;
  planoId?: 'Gratuito' | 'Basico' | 'Profissional' | 'Empresarial';
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

function InnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, isUserLoading, userError } = useUser();
  const { toast } = useToast();
  
  const [users, setUsers] = useLocalStorage<UserProfile[]>('global-users', []);

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<FormInputs>();
  const passwordValue = watch("password");

  const defaultAdminUser: Omit<UserProfile, 'id' | 'uid' | 'creationDate'> = {
    name: 'Geovani Nunes',
    email: 'geovanisilvadeoliveira447@gmail.com',
    isAdmin: true,
    isMaster: true,
    permissions: {},
    allowedCompanyIds: [],
    status: 'Ativo',
  };
  
  useEffect(() => {
    const selectedPlan = searchParams.get('plano') as FormInputs['planoId'];
    if (selectedPlan) {
        sessionStorage.setItem('selectedPlan', selectedPlan);
        if (isSignUp) {
            setValue('planoId', selectedPlan);
        }
    } else if (isSignUp) {
        setValue('planoId', 'Basico'); // Default to basic if no plan is in URL
    }
}, [searchParams, isSignUp, setValue]);

  useEffect(() => {
    // This effect handles the post-authentication logic
    if (isUserLoading) {
      return; // Do nothing while Firebase is checking auth state
    }
    
    // User is authenticated
    if (user) {
        const { email, displayName, uid, metadata } = user;
        const creationTime = metadata.creationTime;
        let existingProfile = users.find(u => u.email === email);
        
        if (existingProfile) {
            // Patch existing profile if UID or creation date is missing
            let needsUpdate = false;
            if (!existingProfile.uid) {
                existingProfile.uid = uid;
                needsUpdate = true;
            }
            if (!existingProfile.creationDate) {
                existingProfile.creationDate = creationTime;
                needsUpdate = true;
            }

            if (needsUpdate) {
                setUsers(prev => prev.map(u => u.id === existingProfile!.id ? existingProfile! : u));
            }


            // License Expiry Check
            if (existingProfile.dataExpiracaoLicenca && new Date() > new Date(existingProfile.dataExpiracaoLicenca)) {
                if (existingProfile.status === 'Ativo') {
                    // Revoke access by setting status to Inativo
                    existingProfile.status = 'Inativo';
                    setUsers(prev => prev.map(u => u.id === existingProfile!.id ? existingProfile! : u));
                    toast({ variant: 'destructive', title: 'Licença Expirada', description: 'Sua licença de acesso expirou. Contate o suporte.' });
                    auth.signOut();
                    setIsAuthLoading(false);
                    return;
                }
            }

            // User profile exists, check its status
            if (existingProfile.status === 'Pendente') {
                router.push('/pending');
                return;
            }
             if (existingProfile.status === 'Inativo') {
                toast({ variant: 'destructive', title: 'Acesso Bloqueado', description: 'Seu perfil está inativo. Contate o administrador.' });
                auth.signOut(); // Log out the user
                setIsAuthLoading(false);
                return;
            }
            // User is active, proceed to company selection
            sessionStorage.setItem('user-profile', JSON.stringify(existingProfile));
            router.push('/selecionar-empresa');
        } else {
            // New user, create a profile
            const isFirstUser = users.length === 0;
            const isAdminEmail = email === 'geovanisilvadeoliveira447@gmail.com';
            
            // For new users, get plan from form data if available
            const formData = (window as any).__LAST_SIGNUP_FORM_DATA;
            const planId = formData?.planoId || sessionStorage.getItem('selectedPlan') || 'Basico';

            const newUserProfile: UserProfile = {
                id: Date.now(),
                uid: uid,
                creationDate: creationTime,
                name: displayName || formData?.fullname || email || 'Novo Usuário',
                email: email!,
                isAdmin: isFirstUser || isAdminEmail,
                isMaster: isFirstUser || isAdminEmail,
                status: (isFirstUser || isAdminEmail) ? 'Ativo' : 'Pendente',
                permissions: {},
                allowedCompanyIds: [],
                planoId: planId,
            };
            
            setUsers(prev => [...prev, newUserProfile]);

            if (newUserProfile.status === 'Pendente') {
                router.push('/pending');
            } else {
                 sessionStorage.setItem('user-profile', JSON.stringify(newUserProfile));
                 router.push('/selecionar-empresa');
            }
        }
        setIsAuthLoading(false);
        return; // End processing
    }

    // No user is authenticated, and there was an error during the process
    if (userError) {
      setIsAuthLoading(false);
      const errorCode = (userError as any).code;

      if (isSignUp && errorCode === 'auth/email-already-in-use') {
        // If sign-up fails because email exists, try to sign them in instead.
        const formData = (window as any).__LAST_SIGNUP_FORM_DATA;
        if (formData) {
            toast({ title: 'E-mail já cadastrado', description: 'Tentando fazer login para você.' });
            initiateEmailSignIn(auth, formData.email, formData.password);
        }
      } else {
        toast({
          variant: 'destructive',
          title: isSignUp ? "Erro ao Criar Conta" : "Erro de Login",
          description: errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential'
              ? 'E-mail ou senha inválidos.'
              : 'Ocorreu um erro. Por favor, tente novamente.',
        });
      }
      reset(); // Clear form fields
    }
}, [user, isUserLoading, userError, router, toast, isSignUp, users, setUsers, auth, reset]);



  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirection is handled by the useEffect hook
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: 'destructive',
        title: "Erro no Login com Google",
        description: error.message || "Não foi possível fazer login com o Google. Tente novamente.",
      });
      setIsAuthLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    setIsAuthLoading(true);
    if (isSignUp) {
        // Store form data globally in case we need to retry as a sign-in
        (window as any).__LAST_SIGNUP_FORM_DATA = data; 
      initiateEmailSignUp(auth, data.email, data.password);
    } else {
      initiateEmailSignIn(auth, data.email, data.password);
    }
  };

  if (isUserLoading || (!isAuthLoading && user)) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <>
                <div className="grid gap-2">
                <Label htmlFor="fullname">Nome Completo</Label>
                <Input id="fullname" type="text" {...register("fullname", { required: "O nome é obrigatório" })} placeholder="Seu nome completo" />
                    {errors.fullname && <p className="text-xs text-destructive mt-1">{errors.fullname.message}</p>}
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="planoId">Plano Desejado</Label>
                     <Select {...register("planoId")} onValueChange={(value) => setValue('planoId', value as any)} defaultValue={searchParams.get('plano') || 'Basico'}>
                        <SelectTrigger id="planoId">
                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Basico">Plano Básico</SelectItem>
                            <SelectItem value="Profissional">Plano Profissional</SelectItem>
                            <SelectItem value="Empresarial">Plano Empresarial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
             <Input id="email" type="email" {...register("email", { required: "O e-mail é obrigatório" })} placeholder="email@exemplo.com" />
             {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
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
              <Input id="password" type={showPassword ? "text" : "password"} {...register("password", { required: "A senha é obrigatória", minLength: { value: 6, message: "A senha deve ter pelo menos 6 caracteres" } })} placeholder="Sua senha" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
             {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>
          
          {isSignUp && (
             <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input id="confirmPassword" type="password" {...register("confirmPassword", { required: "A confirmação da senha é obrigatória", validate: value => value === passwordValue || "As senhas não coincidem" })} placeholder="Repita sua senha" />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>
          )}

          <Button type="submit" className="w-full font-semibold" disabled={isAuthLoading}>
             {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Criar minha conta' : 'Entrar'}
          </Button>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isAuthLoading}>
                {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                Login com Google
            </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {isSignUp ? 'Já tem uma conta?' : "Não tem uma conta?"}{' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline" disabled={isAuthLoading}>
            {isSignUp ? 'Entrar' : 'Crie uma agora'}
          </button>
        </div>
      </div>
  );
}


export default function LoginForm() {
  return (
    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
      <InnerLoginForm />
    </Suspense>
  )
}

    