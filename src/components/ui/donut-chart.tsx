
'use client';

import * as React from 'react';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';

import { cn } from '@/lib/utils';
import { ChartTooltipContent } from './chart';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  className?: string;
  valueFormatter: (value: number) => string;
}

export function DonutChart({ data, className, valueFormatter }: DonutChartProps) {
  const totalValue = React.useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);

  return (
    <div className={cn('relative', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name, item) => (
                    <div className="flex items-center">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-2" style={{ backgroundColor: item.payload.color }} />
                        <div className="flex-1 text-muted-foreground">{name}</div>
                        <div className="font-bold ml-4">{valueFormatter(value as number)}</div>
                    </div>
                )}
            />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            strokeWidth={0}
            paddingAngle={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-2xl font-bold">{valueFormatter(totalValue)}</span>
      </div>
    </div>
  );
}
