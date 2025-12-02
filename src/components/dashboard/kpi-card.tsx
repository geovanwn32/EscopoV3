import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

export default function KpiCard({ title, value, change, changeType }: KpiCardProps) {
  const isIncrease = changeType === 'increase';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isIncrease ? (
            <ArrowUpRight className="h-4 w-4 text-success-foreground" />
        ) : (
            <ArrowDownRight className="h-4 w-4 text-destructive" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            'text-xs text-muted-foreground',
            isIncrease ? 'text-emerald-500' : 'text-red-500'
          )}
        >
          {change} em relação ao mês passado
        </p>
      </CardContent>
    </Card>
  );
}
