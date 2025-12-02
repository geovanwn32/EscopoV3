
'use client';

import { Settings } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { Button } from '@/components/ui/button';
import KpiCard from '@/components/dashboard/kpi-card';
import ResultsChart from '@/components/dashboard/results-chart';
import Agenda from '@/components/dashboard/agenda';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const defaultKpis = [
  { id: 'faturamento', title: 'Faturamento', value: 'R$ 0,00', change: '0%', changeType: 'increase', enabled: true },
  { id: 'despesas', title: 'Compras/Despesas', value: 'R$ 0,00', change: '0%', changeType: 'increase', enabled: true },
  { id: 'notas', title: 'Notas Emitidas', value: '0', change: '0%', changeType: 'decrease', enabled: true },
  { id: 'resultado', title: 'Resultado', value: 'R$ 0,00', change: '0%', changeType: 'increase', enabled: true },
  { id: 'impostos', title: 'Impostos a Pagar', value: 'R$ 0,00', change: '0%', changeType: 'increase', enabled: false },
];

export default function DashboardPage() {
  const { useScopedData } = useCompany();
  const [kpis, setKpis] = useScopedData('dashboard-kpis', defaultKpis);
  
  const handleKpiToggle = (id: string, checked: boolean) => {
    setKpis(kpis.map(kpi => kpi.id === id ? { ...kpi, enabled: checked } : kpi));
  };
  
  const visibleKpis = kpis.filter(kpi => kpi.enabled);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Visão Geral</h1>
        <DashboardSettings kpis={kpis} onKpiToggle={handleKpiToggle} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleKpis.map((kpi) => (
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

interface DashboardSettingsProps {
    kpis: typeof defaultKpis;
    onKpiToggle: (id: string, checked: boolean) => void;
}

function DashboardSettings({ kpis, onKpiToggle }: DashboardSettingsProps) {
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
                    {kpis.map(kpi => (
                        <div key={kpi.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <Label htmlFor={`kpi-${kpi.id}`}>{kpi.title}</Label>
                            <Switch 
                                id={`kpi-${kpi.id}`} 
                                checked={kpi.enabled}
                                onCheckedChange={(checked) => onKpiToggle(kpi.id, checked)}
                            />
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
