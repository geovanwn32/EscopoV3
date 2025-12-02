
'use client';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

type ChartData = { month: string; revenue: number; expenses: number };

const chartConfig = {
    revenue: {
      label: "Receitas",
      color: "hsl(var(--chart-2))",
    },
    expenses: {
      label: "Despesas",
      color: "hsl(var(--chart-1))",
    },
  }

interface ResultsChartProps {
    data: ChartData[];
}

export default function ResultsChart({ data }: ResultsChartProps) {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <div>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Receitas e despesas dos últimos meses</CardDescription>
        </div>
        <Select>
            <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder="Últimos 8 meses" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="8">Últimos 8 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Últimos 12 meses</SelectItem>
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            {data.length > 0 ? (
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)"/>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(value) => `${Number(value) / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        indicator="dot" 
                        formatter={(value, name) => (
                            <div className="flex items-center">
                                <div className="flex-1">{chartConfig[name as keyof typeof chartConfig].label}</div>
                                <div className="font-bold ml-4">{Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                            </div>
                        )}
                    />}
                />
                <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  stackId="a"
                  strokeWidth={2}
                />
                 <Area
                  dataKey="expenses"
                  type="natural"
                  fill="url(#fillExpenses)"
                  stroke="var(--color-expenses)"
                  stackId="b"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível para exibir.</p>
                </div>
            )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
