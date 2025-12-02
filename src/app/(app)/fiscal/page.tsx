import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus, FileText, Search, Settings, Upload } from "lucide-react";

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
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
              <ActionCard icon={<Upload />} label="Importar XML" />
              <ActionCard icon={<FilePlus />} label="Nova Nota" />
              <ActionCard icon={<FileText />} label="Gerar Relatório" />
              <ActionCard icon={<Search />} label="Consultar NFe" />
              <ActionCard icon={<Settings />} label="Configurações" />
            </div>
          </CardContent>
        </Card>

      </div>
    );
}

function ActionCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <Button variant="outline" className="flex flex-col h-28 items-center justify-center gap-2">
      <div className="h-8 w-8">{icon}</div>
      <span className="text-sm font-normal">{label}</span>
    </Button>
  )
}
