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

const chartData = [
  { month: 'Janeiro', revenue: 18600, expenses: 8000 },
  { month: 'Fevereiro', revenue: 30500, expenses: 13980 },
  { month: 'Março', revenue: 23700, expenses: 9800 },
  { month: 'Abril', revenue: 27800, expenses: 12900 },
  { month: 'Maio', revenue: 18900, expenses: 9000 },
  { month: 'Junho', revenue: 23900, expenses: 11800 },
];

const chartConfig = {
    revenue: {
      label: "Receitas",
      color: "hsl(var(--chart-2))",
    },
    expenses: {
      label: "Despesas",
      color: "hsl(var(--chart-5))",
    },
  }

export default function ResultsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados dos Últimos 6 Meses</CardTitle>
        <CardDescription>Comparativo entre receitas e despesas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
                data={chartData}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) => `R$${Number(value) / 1000}k`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="var(--color-revenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
              stackId="a"
            />
             <Area
              dataKey="expenses"
              type="natural"
              fill="var(--color-expenses)"
              fillOpacity={0.4}
              stroke="var(--color-expenses)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
