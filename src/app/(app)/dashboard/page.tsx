
'use client';

import { Settings, User, Briefcase, FileText, ArrowRight, MoreHorizontal } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import KpiCard from '@/components/dashboard/kpi-card';
import ResultsChart from '@/components/dashboard/results-chart';
import Agenda from '@/components/dashboard/agenda';
import { useMemo } from 'react';
import { Conta } from '@/types/financeiro';
import { NotaFiscal } from '@/types/fiscal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DonutChart } from '@/components/ui/donut-chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const defaultKpiSettings = [
  { id: 'faturamento', title: 'Faturamento', enabled: true },
  { id: 'despesas', title: 'Compras/Despesas', enabled: true },
  { id: 'notas', title: 'Notas Emitidas', enabled: true },
  { id: 'resultado', title: 'Resultado', enabled: true },
];

const attendanceData = [
  { name: 'Mon', value: 75 },
  { name: 'Tue', value: 90 },
  { name: 'Wed', value: 80 },
  { name: 'Thu', value: 65 },
  { name: 'Fri', value: 85 },
];


export default function DashboardPage() {
  const { useScopedData } = useCompany();
  
  const [contasReceber] = useScopedData<Conta[]>('financeiro-contas-a-receber', []);
  const [contasPagar] = useScopedData<Conta[]>('financeiro-contas-a-pagar', []);
  const [notasSaida] = useScopedData<NotaFiscal[]>('fiscal-notasSaida', []);
  const [notasServico] = useScopedData<NotaFiscal[]>('fiscal-notasServico', []);

  const kpiData = useMemo(() => {
    const faturamento = contasReceber
        .filter(c => c.status === 'Recebido')
        .reduce((acc, c) => acc + c.amount, 0);

    const despesas = contasPagar
        .reduce((acc, c) => acc + c.amount, 0);

    const notasEmitidas = notasSaida.length + notasServico.length;
    const resultado = faturamento - despesas;
    
    return { faturamento, despesas, notasEmitidas, resultado };
  }, [contasReceber, contasPagar, notasSaida, notasServico]);

   const chartData = useMemo(() => {
    const months = Array.from({ length: 8 }, (_, i) => {
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
      { id: 'faturamento', title: 'Faturamento', value: kpiData.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}), icon: <User/>, variant: 'default' },
      { id: 'despesas', title: 'Compras/Despesas', value: kpiData.despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}), icon: <Briefcase/>, variant: 'default' },
      { id: 'notas', title: 'Notas Emitidas', value: kpiData.notasEmitidas.toString(), icon: <FileText />, variant: 'default' },
      { id: 'resultado', title: 'Resultado', value: kpiData.resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}), icon: <ArrowRight />, variant: 'primary' },
  ];

  return (
    <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {allKpis.map((kpi) => (
            <KpiCard key={kpi.id} {...kpi} />
            ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Visão Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                            <DonutChart
                            data={[
                                { name: 'Receitas', value: kpiData.faturamento, color: 'hsl(var(--chart-2))' },
                                { name: 'Despesas', value: kpiData.despesas, color: 'hsl(var(--chart-1))' },
                            ]}
                            valueFormatter={(v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            className="h-48"
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <ResultsChart data={chartData} />
            </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className='flex-row justify-between items-center'>
                        <CardTitle>Atividades da Empresa</CardTitle>
                        <MoreHorizontal className='text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={attendanceData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
                <div className="lg:col-span-1">
                    <Card>
                    <CardHeader>
                        <CardTitle>Notificações</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground pt-8">
                        <p>Em breve...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="xl:hidden">
            <Agenda />
        </div>
    </div>
  );
}
