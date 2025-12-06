'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileQuestion, ArrowLeft, Search, FileText, Book, Banknote, Archive } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <FileQuestion className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Oops! Página Não Encontrada</CardTitle>
            <CardDescription>
                A página que você está tentando acessar não existe ou foi movida.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <p className="text-muted-foreground">
                Tente procurar no sistema ou use um dos links rápidos abaixo.
            </p>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Procurar no sistema..." className="pl-10" />
            </div>
             <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Links Rápidos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button variant="outline" asChild><Link href="/fiscal"><FileText className="mr-2 h-4 w-4"/>Fiscal</Link></Button>
                    <Button variant="outline" asChild><Link href="/contabil"><Book className="mr-2 h-4 w-4"/>Contábil</Link></Button>
                    <Button variant="outline" asChild><Link href="/financeiro"><Banknote className="mr-2 h-4 w-4"/>Financeiro</Link></Button>
                    <Button variant="outline" asChild><Link href="/cadastros"><Archive className="mr-2 h-4 w-4"/>Cadastros</Link></Button>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-6">
            <Button asChild className="w-full">
                <Link href="/dashboard">
                    Ir para o Dashboard
                </Link>
            </Button>
             <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a página anterior
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
