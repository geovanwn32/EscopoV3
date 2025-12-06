'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <FileQuestion className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Oops! Página Não Encontrada</CardTitle>
            <CardDescription>
                A página que você está tentando acessar não existe ou foi movida.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Verifique se o endereço foi digitado corretamente ou retorne ao painel principal.
            </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button asChild className="w-full">
                <Link href="/dashboard">
                    Ir para o Dashboard
                </Link>
            </Button>
             <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
