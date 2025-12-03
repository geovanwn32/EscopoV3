
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Phone, Loader2, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignUp, initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useLocalStorage } from '@/hooks/use-company';

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
}


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

function InnerLoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading, userError } = useUser();
  const { toast } = useToast();
  
  const [users, setUsers] = useLocalStorage<UserProfile[]>('global-users', []);

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();

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
            router.push('/selecionar-perfil');
        } else {
            // New user, create a profile
            const isFirstUser = users.length === 0;
            const isAdminEmail = email === 'geovanisilvadeoliveira447@gmail.com';

            const newUserProfile: UserProfile = {
                id: Date.now(),
                uid: uid,
                creationDate: creationTime,
                name: displayName || email || 'Novo Usuário',
                email: email!,
                isAdmin: isFirstUser || isAdminEmail,
                isMaster: isFirstUser || isAdminEmail,
                status: (isFirstUser || isAdminEmail) ? 'Ativo' : 'Pendente',
                permissions: {},
                allowedCompanyIds: [],
            };
            
            setUsers(prev => [...prev, newUserProfile]);

            if (newUserProfile.status === 'Pendente') {
                router.push('/pending');
            } else {
                 sessionStorage.setItem('user-profile', JSON.stringify(newUserProfile));
                 router.push('/selecionar-perfil');
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
    <div className="p-8 sm:p-12 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <h2 className="text-3xl font-bold mb-2">{isSignUp ? "Criar Conta" : "Login"}</h2>
        <p className="text-muted-foreground mb-8">{isSignUp ? "Insira seus dados para começar." : "Insira seus dados para acessar o sistema."}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullname">Nome Completo:</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="fullname" type="text" {...register("fullname", { required: true })} placeholder="Seu nome completo" className="bg-muted/50 pl-10" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email:</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="email" type="email" {...register("email", { required: true })} placeholder="email@exemplo.com" className="bg-muted/50 pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha:</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} {...register("password", { required: true, minLength: 6 })} placeholder="Sua senha" className="bg-muted/50 pl-10 pr-10" />
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

          <div className="flex items-center justify-between text-sm pt-2">
            <div className='flex items-center'>
              {isSignUp ? (
                <div className="flex items-start">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="ml-2 font-normal text-muted-foreground text-xs">
                    Envie-me ofertas e dicas de aprendizado.
                  </Label>
                </div>
              ) : (
                <>
                  <Checkbox id="remember" {...register("remember")} />
                  <Label htmlFor="remember" className="ml-2 font-normal text-muted-foreground">Lembrar-me</Label>
                </>
              )}
            </div>
            {!isSignUp && (
              <a href="#" className="font-medium text-primary hover:underline">
                Esqueceu sua senha?
              </a>
            )}
          </div>

          <Button type="submit" className="w-full font-semibold text-lg py-6 mt-6" disabled={isAuthLoading}>
             {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Continuar' : 'Entrar'}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">Ou continue com</span></div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" className="gap-2 bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-100 dark:bg-card-foreground/5 dark:border-border dark:text-foreground dark:hover:bg-card-foreground/10 transition-colors" onClick={handleGoogleSignIn} disabled={isAuthLoading}>
            {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Login com Google
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {isSignUp ? 'Já tem uma conta?' : "Não tem uma conta?"}{' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline" disabled={isAuthLoading}>
            {isSignUp ? 'Entrar' : 'Crie uma agora'}
          </button>
        </p>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">Precisa de Ajuda?</p>
            <TooltipProvider>
              <div className="flex justify-center gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" asChild className='text-muted-foreground hover:text-primary transition-colors'>
                        <a href="https://wa.me/5562998554529" target="_blank" rel="noopener noreferrer" aria-label="Entrar em contato via WhatsApp">
                          <Phone className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>WhatsApp</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" asChild className='text-muted-foreground hover:text-primary transition-colors'>
                        <a href="mailto:geovaniwn@gmail.com" aria-label="Enviar email para o suporte">
                          <Mail className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Email</p>
                    </TooltipContent>
                  </Tooltip>
              </div>
            </TooltipProvider>
        </div>
      </div>
    </div>
  );
}


export default function LoginForm() {
  return (
      <InnerLoginForm />
  )
}
