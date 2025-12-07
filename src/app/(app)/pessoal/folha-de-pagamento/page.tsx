
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FolhaDePagamentoPage() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/pessoal">
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight font-headline">Folha de Pagamento</h1>
              <p className="text-muted-foreground">
                Calcule a folha de pagamento mensal de seus funcionários.
              </p>
            </div>
        </div>
      </div>
    );
  }
