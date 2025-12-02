
'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface AgendaEvent {
    id: number;
    date: string;
    description: string;
    startTime: string;
    endTime: string;
    tag: string;
    tagColor: string;
}

const defaultEvents: AgendaEvent[] = [
    { 
        id: 1,
        date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), 
        description: 'Vencimento do DAS',
        startTime: '09:00',
        endTime: '17:00',
        tag: 'Fiscal',
        tagColor: 'bg-red-500'
    },
    { 
        id: 2,
        date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), 
        description: 'Entrega da EFD-Contribuições',
        startTime: '10:00',
        endTime: '11:00',
        tag: 'Contábil',
        tagColor: 'bg-sky-500'
    },
];

export default function Agenda() {
  const { useScopedData } = useCompany();
  const [events, setEvents] = useScopedData<AgendaEvent[]>('dashboard-agenda-events', defaultEvents);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventsForSelectedDay = events.filter(event => {
    if (!date) return false;
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === date.toDateString();
  });

  return (
    <div className="flex h-full flex-col space-y-6">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-2xl border bg-card"
            classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-primary/20 text-primary",
                head_cell: "w-10",
                cell: "w-10 h-10",
                day: "w-10 h-10",
            }}
             components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
        />
        <Card className="flex-1">
            <CardHeader className='flex-row justify-between items-center'>
                <CardTitle>Próximos Eventos</CardTitle>
                <MoreHorizontal className='text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-4'>
                 {events.length > 0 ? (
                  events.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 text-sm p-3 rounded-lg border bg-background">
                          <div className="flex flex-col items-center">
                            <Badge className={cn("text-xs", event.tagColor)}>{event.tag}</Badge>
                            <span className='font-mono text-xs'>{event.startTime}</span>
                          </div>
                          <div className="text-foreground font-medium">{event.description}</div>
                      </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento agendado.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
