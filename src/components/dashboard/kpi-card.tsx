
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary';
}

export default function KpiCard({ title, value, icon, variant = 'default' }: KpiCardProps) {
  return (
    <Card className={cn(
      "rounded-2xl",
      variant === 'default' ? 'bg-accent' : 'bg-primary text-primary-foreground'
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-bold">{value}</div>
        <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full",
            variant === 'default' ? 'bg-black/10' : 'bg-white/20'
        )}>
            {icon}
        </div>
      </CardContent>
    </Card>
  );
}
