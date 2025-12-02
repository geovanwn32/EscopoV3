
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
import { useMemo } from 'react';
import { Conta } from '@/types/financeiro';
import { NotaFiscal } from '@/types/fiscal';

const defaultKpiSettings = [
  { id: 'faturamento', title: 'Faturamento', enabled: true },
  { id: 'despesas', title: 'Compras/Despesas', enabled: true },
  { id: 'notas', title: 'Notas Emitidas', enabled: true },
  { id: 'resultado', title: 'Resultado', enabled: true },
  { id: 'impostos', title: 'Impostos a Pagar', enabled: false },
];

export default function DashboardPage() {
  const { useScopedData } = useCompany();
  const [kpiSettings, setKpiSettings] = useScopedData('dashboard-kpi-settings', defaultKpiSettings);
  
  // Fetching data from other modules
  const [contasReceber] = useScopedData<Conta[]>('financeiro-contas-a-receber', []);
  const [contasPagar] = useScopedData<Conta[]>('financeiro-contas-a-pagar', []);
  const [notasProduto] = useScopedData<NotaFiscal[]>('fiscal-notasProduto', []);
  const [notasSaida] = useScopedData<NotaFiscal[]>('fiscal-notasSaida', []);
  const [notasServico] = useScopedData<NotaFiscal[]>('fiscal-notasServico', []);

  const kpiData = useMemo(() => {
    const faturamento = contasReceber
        .filter(c => c.status === 'Recebido')
        .reduce((acc, c) => acc + c.amount, 0);

    // Assuming despesas are from contas a pagar (can be refined)
    const despesas = contasPagar
        .filter(c => c.status === 'Pendente' || c.status === 'Atrasado') // Placeholder for "paid" status if it exists
        .reduce((acc, c) => acc + c.amount, 0);

    const notasEmitidas = notasSaida.length + notasServico.length;
    const resultado = faturamento - despesas;
    
    return { faturamento, despesas, notasEmitidas, resultado };
  }, [contasReceber, contasPagar, notasSaida, notasServico]);

   const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), revenue: 0, expenses: 0 };
    }).reverse();

    contasReceber.forEach(c => {
        if (c.status === 'Recebido') {
            const date = new Date(c.dueDate);
            const monthStr = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const monthData = months.find(m => m.month === monthStr && m.year === year);
            if (monthData) {
                monthData.revenue += c.amount;
            }
        }
    });

    // We need a "paid" status for expenses to be accurate
    contasPagar.forEach(c => {
        const date = new Date(c.dueDate);
        const monthStr = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthData = months.find(m => m.month === monthStr && m.year === year);
        if (monthData) {
            monthData.expenses += c.amount;
        }
    });

    return months.map(({ month, revenue, expenses }) => ({ month, revenue, expenses }));
}, [contasReceber, contasPagar]);
  
  const allKpis = [
      { id: 'faturamento', title: 'Faturamento', value: kpiData.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}), change: '+2.5%', changeType: 'increase' },
      { id: 'despesas', title: 'Compras/Despesas', value: kpiData.despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}), change: '+10.2%', changeType: 'increase' },
      { id: 'notas', title: 'Notas Emitidas', value: kpiData.notasEmitidas.toString(), change: '-5', changeType: 'decrease' },
      { id: 'resultado', title: 'Resultado', value: kpiData.resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}), change: '-1.8%', changeType: 'decrease' },
      { id: 'impostos', title: 'Impostos a Pagar', value: 'R$ 0,00', change: '0%', changeType: 'increase' },
  ];

  const handleKpiToggle = (id: string, checked: boolean) => {
    setKpiSettings(kpiSettings.map(kpi => kpi.id === id ? { ...kpi, enabled: checked } : kpi));
  };
  
  const visibleKpis = allKpis.filter(kpi => kpiSettings.find(s => s.id === kpi.id)?.enabled);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Visão Geral</h1>
        <DashboardSettings kpis={kpiSettings} onKpiToggle={handleKpiToggle} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleKpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ResultsChart data={chartData} />
        </div>
        <div className="lg:col-span-1">
          <Agenda />
        </div>
      </div>
    </div>
  );
}

interface DashboardSettingsProps {
    kpis: typeof defaultKpiSettings;
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
