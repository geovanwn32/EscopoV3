import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PackagePlus, FileText, Wrench, Settings, Upload, FileMinus, Receipt } from "lucide-react";
import Link from "next/link";

const actions = [
    {
        icon: <Upload className="h-8 w-8" />,
        label: "Importar XML",
        href: "#",
        color: "text-sky-600 bg-sky-100/80 group-hover:bg-sky-600 dark:bg-sky-900/40 dark:text-sky-400 dark:group-hover:bg-sky-500",
    },
    {
        icon: <PackagePlus className="h-8 w-8" />,
        label: "Nota Produto",
        href: "#",
        color: "text-emerald-600 bg-emerald-100/80 group-hover:bg-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-500",
    },
    {
        icon: <FileMinus className="h-8 w-8" />,
        label: "Nota Saída",
        href: "#",
        color: "text-amber-600 bg-amber-100/80 group-hover:bg-amber-600 dark:bg-amber-900/40 dark:text-amber-400 dark:group-hover:bg-amber-500",
    },
    {
        icon: <Wrench className="h-8 w-8" />,
        label: "Nota Serviço",
        href: "#",
        color: "text-indigo-600 bg-indigo-100/80 group-hover:bg-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 dark:group-hover:bg-indigo-500",
    },
    {
        icon: <Receipt className="h-8 w-8" />,
        label: "Recibos/Cupons",
        href: "#",
        color: "text-slate-600 bg-slate-100/80 group-hover:bg-slate-600 dark:bg-slate-700/40 dark:text-slate-400 dark:group-hover:bg-slate-500",
    },
]

export default function FiscalPage() {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Lançamentos Fiscais</h1>
          <p className="text-muted-foreground">
            Importe XMLs ou lance manualmente suas notas e recibos.
          </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse as principais funcionalidades do módulo fiscal.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {actions.map((action) => (
                    <ActionTile key={action.label} {...action} />
                ))}
            </CardContent>
        </Card>
      </div>
    );
}

function ActionTile({ icon, label, href = "#", color }: { icon: React.ReactNode, label: string, href?: string, color: string }) {
  return (
    <Link href={href}>
        <div className="group flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className={cn(
                "rounded-full p-3 transition-colors group-hover:text-primary-foreground",
                color
            )}>
                {icon}
            </div>
            <span className="text-center text-sm font-semibold">{label}</span>
        </div>
    </Link>
  )
}
