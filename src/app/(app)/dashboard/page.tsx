import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import KpiCard from '@/components/dashboard/kpi-card';
import ResultsChart from '@/components/dashboard/results-chart';
import Agenda from '@/components/dashboard/agenda';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const kpis = [
  { title: 'Faturamento', value: 'R$ 125.430,50', change: '+12.5%', changeType: 'increase' },
  { title: 'Compras/Despesas', value: 'R$ 75.120,00', change: '+5.2%', changeType: 'increase' },
  { title: 'Notas Emitidas', value: '342', change: '-2.1%', changeType: 'decrease' },
  { title: 'Resultado', value: 'R$ 50.310,50', change: '+20.1%', changeType: 'increase' },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Visão Geral</h1>
        <DashboardSettings />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ResultsChart />
        </div>
        <div className="lg:col-span-1">
          <Agenda />
        </div>
      </div>
    </div>
  );
}

function DashboardSettings() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Configurar KPIs</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Configurar KPIs do Dashboard</SheetTitle>
                    <SheetDescription>
                        Selecione as métricas que você deseja visualizar no seu dashboard.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="kpi-faturamento">Faturamento</Label>
                        <Switch id="kpi-faturamento" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="kpi-despesas">Compras/Despesas</Label>
                        <Switch id="kpi-despesas" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="kpi-notas">Notas Emitidas</Label>
                        <Switch id="kpi-notas" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="kpi-resultado">Resultado</Label>
                        <Switch id="kpi-resultado" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="kpi-impostos">Impostos a Pagar</Label>
                        <Switch id="kpi-impostos" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
