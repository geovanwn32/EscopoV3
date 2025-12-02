
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, ShieldCheck, ServerCrash, Calendar, Folder } from 'lucide-react';
import Link from 'next/link';

const utilities = [
    {
        href: '/utilitarios/audit-trail',
        icon: <ShieldCheck className="h-8 w-8" />,
        label: 'Trilha de Auditoria',
        description: 'Acompanhe as ações e modificações no sistema.',
        color: "text-sky-600 bg-sky-100/80 group-hover:bg-sky-600 dark:bg-sky-900/40 dark:text-sky-400 dark:group-hover:bg-sky-500",
    },
    {
        href: '/utilitarios/gov-status',
        icon: <ServerCrash className="h-8 w-8" />,
        label: 'Status de Serviços',
        description: 'Verifique a disponibilidade dos serviços do governo.',
        color: "text-amber-600 bg-amber-100/80 group-hover:bg-amber-600 dark:bg-amber-900/40 dark:text-amber-400 dark:group-hover:bg-amber-500",
    },
    {
        href: '/utilitarios/eventos',
        icon: <Calendar className="h-8 w-8" />,
        label: 'Agenda de Eventos',
        description: 'Gerencie os eventos e lembretes do dashboard.',
        color: "text-emerald-600 bg-emerald-100/80 group-hover:bg-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-500",
    },
    {
        href: '/utilitarios/arquivos',
        icon: <Folder className="h-8 w-8" />,
        label: 'Arquivos',
        description: 'Repositório para upload e download de arquivos.',
        color: "text-indigo-600 bg-indigo-100/80 group-hover:bg-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 dark:group-hover:bg-indigo-500",
    },
]

export default function UtilitariosPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Utilitários</h1>
                <p className="text-muted-foreground">
                    Ferramentas de apoio para otimizar sua gestão e conformidade.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Central de Utilitários</CardTitle>
                    <CardDescription>Acesse as ferramentas auxiliares do sistema.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {utilities.map((util) => (
                        <Link key={util.href} href={util.href}>
                            <div className="group flex h-full cursor-pointer flex-col gap-2 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                <div className={`rounded-full p-3 transition-colors group-hover:text-primary-foreground self-start ${util.color}`}>
                                    {util.icon}
                                </div>
                                <h3 className="text-lg font-semibold">{util.label}</h3>
                                <p className="text-sm text-muted-foreground">{util.description}</p>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
