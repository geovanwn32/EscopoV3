'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { suggestTransactionDescriptions } from '@/ai/flows/suggest-transaction-descriptions';

const formSchema = z.object({
  transactionAmount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
  accountDebited: z.string().min(1, 'A conta de débito é obrigatória.'),
  accountCredited: z.string().min(1, 'A conta de crédito é obrigatória.'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DescriptionGeneratorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionAmount: undefined,
      accountDebited: '',
      accountCredited: '',
      description: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    form.setValue('description', '');
    try {
      const result = await suggestTransactionDescriptions({
        transactionAmount: values.transactionAmount,
        accountDebited: values.accountDebited,
        accountCredited: values.accountCredited
      });
      if (result.suggestedDescription) {
        form.setValue('description', result.suggestedDescription);
        toast({
            title: 'Sugestão Gerada!',
            description: 'A IA sugeriu uma descrição para a sua transação.',
        });
      } else {
        throw new Error('A resposta da IA está vazia.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar sugestão',
        description: 'Não foi possível se comunicar com o serviço de IA. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Gerador de Descrição de Transação</CardTitle>
            <CardDescription>
              Preencha os detalhes da transação para que a IA sugira uma descrição.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="transactionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Transação (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder="0,00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountDebited"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta Debitada</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Despesas com Salários" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountCredited"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta Creditada</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Caixa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Sugerida</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A sugestão da IA aparecerá aqui..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

          </CardContent>
          <CardFooter className="flex justify-between">
            <p className='text-sm text-muted-foreground font-code'>Powered by Genkit AI</p>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Sugerir Descrição
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
