
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';
import Link from 'next/link';

const financeiroItens = [
    {
        href: '/financeiro/contas-a-receber',
        icon: <ArrowUpRight className="h-8 w-8 text-emerald-500" />,
        label: 'Contas a Receber',
        description: 'Gerencie os recebimentos de clientes e vendas.',
        color: "text-emerald-600 bg-emerald-100/80 group-hover:bg-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-500",
    },
    {
        href: '/financeiro/contas-a-pagar',
        icon: <ArrowDownRight className="h-8 w-8 text-red-500" />,
        label: 'Contas a Pagar',
        description: 'Controle as obrigações e despesas da empresa.',
        color: "text-red-600 bg-red-100/80 group-hover:bg-red-600 dark:bg-red-900/40 dark:text-red-400 dark:group-hover:bg-red-500",

    },
    {
        href: '/financeiro/fluxo-de-caixa',
        icon: <Scale className="h-8 w-8" />,
        label: 'Fluxo de Caixa',
        description: 'Visualize as entradas e saídas de caixa.',
        color: "text-sky-600 bg-sky-100/80 group-hover:bg-sky-600 dark:bg-sky-900/40 dark:text-sky-400 dark:group-hover:bg-sky-500",
    },
]

export default function FinanceiroPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Módulo Financeiro</h1>
                <p className="text-muted-foreground">
                    Controle total sobre as finanças da sua empresa.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Central Financeira</CardTitle>
                    <CardDescription>Selecione uma das opções abaixo para gerenciar.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {financeiroItens.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className="group flex h-full cursor-pointer flex-col gap-2 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                <div className={`rounded-full p-3 transition-colors group-hover:text-primary-foreground self-start ${item.color}`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold">{item.label}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
