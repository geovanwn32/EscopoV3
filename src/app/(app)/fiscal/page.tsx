import { Card, CardContent } from "@/components/ui/card";
import { FilePlus, FileText, Search, Settings, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FiscalPage() {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Lançamentos Fiscais</h1>
          <p className="text-muted-foreground">
            Importe XMLs ou lance manualmente suas notas e recibos.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <ActionCard 
                icon={<Upload className="h-8 w-8" />} 
                label="Importar XML" 
                className="bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200"
            />
            <ActionCard 
                icon={<FilePlus className="h-8 w-8" />} 
                label="Nova Nota" 
                className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200"
            />
            <ActionCard 
                icon={<FileText className="h-8 w-8" />} 
                label="Gerar Relatório" 
                className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200"
            />
            <ActionCard 
                icon={<Search className="h-8 w-8" />} 
                label="Consultar NFe" 
                className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200"
            />
            <ActionCard 
                icon={<Settings className="h-8 w-8" />} 
                label="Configurações" 
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            />
        </div>
      </div>
    );
}

function ActionCard({ icon, label, className }: { icon: React.ReactNode, label: string, className?: string }) {
  return (
    <Card className={cn(
        "group cursor-pointer transition-transform hover:scale-105 hover:shadow-lg",
        className
    )}>
        <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
            <div className="transition-transform group-hover:-translate-y-1">
                {icon}
            </div>
            <span className="font-semibold text-center">{label}</span>
        </CardContent>
    </Card>
  )
}