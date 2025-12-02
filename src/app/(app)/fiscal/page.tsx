import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, FileText, Search, Settings, Upload } from "lucide-react";
import Link from "next/link";

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
                <ActionTile 
                    icon={<Upload className="h-8 w-8" />} 
                    label="Importar XML" 
                />
                <ActionTile 
                    icon={<FilePlus className="h-8 w-8" />} 
                    label="Nova Nota" 
                />
                <ActionTile 
                    icon={<FileText className="h-8 w-8" />} 
                    label="Gerar Relatório" 
                />
                <ActionTile 
                    icon={<Search className="h-8 w-8" />} 
                    label="Consultar NFe" 
                />
                <ActionTile 
                    icon={<Settings className="h-8 w-8" />} 
                    label="Configurações" 
                />
            </CardContent>
        </Card>
      </div>
    );
}

function ActionTile({ icon, label, href = "#" }: { icon: React.ReactNode, label: string, href?: string }) {
  return (
    <Link href={href}>
        <div className="group flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-muted/50 cursor-pointer h-full">
            <div className="transition-transform group-hover:scale-110">
                {icon}
            </div>
            <span className="font-semibold text-center text-sm">{label}</span>
        </div>
    </Link>
  )
}