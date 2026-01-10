'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsSuccess(true);
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para o link de redefinição de senha.',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      let description = 'Ocorreu um erro. Tente novamente.';
      if (error.code === 'auth/user-not-found') {
        description = 'Nenhum usuário encontrado com este e-mail.';
      }
      toast({
        variant: 'destructive',
        title: 'Falha ao enviar e-mail',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 animated-gradient">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esqueceu sua Senha?</CardTitle>
          {!isSuccess ? (
            <CardDescription>
              Não se preocupe. Insira seu e-mail e enviaremos um link para você redefinir sua senha.
            </CardDescription>
          ) : (
            <CardDescription>
              Um e-mail foi enviado para o endereço fornecido com as instruções para redefinir sua senha.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!isSuccess ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="seu@email.com" {...field} className="pl-9" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Link de Recuperação
                </Button>
              </form>
            </Form>
          ) : (
             <div className="text-center text-muted-foreground">
                <p>Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam.</p>
             </div>
          )}
        </CardContent>
        <CardHeader>
            <Button variant="ghost" asChild>
                <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Login
                </Link>
            </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
