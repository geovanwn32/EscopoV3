'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Handshake, Truck, Briefcase, FileText, FileType, FileSignature, Scale } from 'lucide-react';
import Link from 'next/link';

const cadastroItens = [
    {
        href: '/cadastros/parceiros',
        icon: <Handshake className="h-8 w-8" />,
        label: 'Parceiros',
        description: 'Gerencie clientes, fornecedores e transportadoras.',
        color: "text-sky-600 bg-sky-100/80 group-hover:bg-sky-600 dark:bg-sky-900/40 dark:text-sky-400 dark:group-hover:bg-sky-500",
    },
    {
        href: '/cadastros/produtos',
        icon: <Package className="h-8 w-8" />,
        label: 'Produtos',
        description: 'Mantenha seu catálogo de produtos atualizado.',
        color: "text-emerald-600 bg-emerald-100/80 group-hover:bg-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-500",
    },
    {
        href: '/cadastros/servicos',
        icon: <Briefcase className="h-8 w-8" />,
        label: 'Serviços',
        description: 'Gerencie os serviços prestados pela sua empresa.',
        color: "text-amber-600 bg-amber-100/80 group-hover:bg-amber-600 dark:bg-amber-900/40 dark:text-amber-400 dark:group-hover:bg-amber-500",
    },
    {
        href: '/funcionarios',
        icon: <Users className="h-8 w-8" />,
        label: 'Funcionários',
        description: 'Gerencie os dados dos seus colaboradores.',
        color: "text-red-600 bg-red-100/80 group-hover:bg-red-600 dark:bg-red-900/40 dark:text-red-400 dark:group-hover:bg-red-500",
    },
    {
        href: '/cadastros/cfop',
        icon: <FileText className="h-8 w-8" />,
        label: 'CFOP',
        description: 'Códigos Fiscais de Operações e Prestações.',
        color: "text-indigo-600 bg-indigo-100/80 group-hover:bg-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 dark:group-hover:bg-indigo-500",
    },
    {
        href: '/cadastros/natureza-operacao',
        icon: <FileSignature className="h-8 w-8" />,
        label: 'Natureza da Operação',
        description: 'Gerencie as naturezas de operação para notas.',
        color: "text-slate-600 bg-slate-100/80 group-hover:bg-slate-600 dark:bg-slate-700/40 dark:text-slate-400 dark:group-hover:bg-slate-500",
    },
    {
        href: '/cadastros/tipo-negociacao',
        icon: <FileType className="h-8 w-8" />,
        label: 'Tipos de Negociação',
        description: 'Condições e tipos de negociação comercial.',
         color: "text-fuchsia-600 bg-fuchsia-100/80 group-hover:bg-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-400 dark:group-hover:bg-fuchsia-500",
    },
    {
        href: '/cadastros/unidade-de-medida',
        icon: <Scale className="h-8 w-8" />,
        label: 'Unidades de Medida',
        description: 'Gerencie as unidades de medida para produtos.',
        color: "text-rose-600 bg-rose-100/80 group-hover:bg-rose-600 dark:bg-rose-900/40 dark:text-rose-400 dark:group-hover:bg-rose-500",
    },
]

export default function CadastrosPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Central de Cadastros</h1>
                <p className="text-muted-foreground">
                    Gerencie as entidades essenciais para o funcionamento do sistema.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Módulos de Cadastro</CardTitle>
                    <CardDescription>Selecione uma das opções abaixo para gerenciar.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cadastroItens.map((item) => (
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
