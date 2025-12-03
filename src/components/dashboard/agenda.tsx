
'use client';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

interface AgendaEvent {
    id: number;
    date: string;
    description: string;
    startTime: string;
    endTime: string;
    tag: string;
    tagColor: string;
}

const defaultEvents: AgendaEvent[] = [];

export default function Agenda() {
  const { useScopedData } = useCompany();
  const [events, setEvents] = useScopedData<AgendaEvent[]>('dashboard-agenda-events', defaultEvents);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventsForSelectedDay = useMemo(() => {
    return events.filter(event => {
        if (!date) return false;
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, date]);

  const eventDays = useMemo(() => events.map(e => new Date(e.date)), [events]);

  return (
    <div className="flex h-full flex-col space-y-6">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-2xl border bg-card"
            locale={ptBR}
            classNames={{
              day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              day_today: "bg-transparent text-primary rounded-full border border-primary",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            }}
             components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
                DayContent: ({ date, ...props }) => {
                    const hasEvent = eventDays.some(eventDate => eventDate.toDateString() === date.toDateString());
                    return (
                        <div className="relative h-9 w-9 flex items-center justify-center">
                            {props.children}
                            {hasEvent && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
                        </div>
                    );
                }
             }}
        />
        <Card className="flex-1">
            <CardHeader className='flex-row justify-between items-center'>
                <div className='space-y-1'>
                    <CardTitle>Agenda do Dia</CardTitle>
                    <CardDescription>{format(date || new Date(), "PPP", { locale: ptBR })}</CardDescription>
                </div>
                <MoreHorizontal className='text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-3'>
                 {eventsForSelectedDay.length > 0 ? (
                  eventsForSelectedDay.map((event) => (
                      <div key={event.id} className="flex items-start gap-4 text-sm p-3 rounded-lg border bg-background/50">
                          <div className="flex flex-col items-center justify-center font-mono text-xs text-muted-foreground pt-1">
                            <span>{event.startTime}</span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className='flex justify-between items-center'>
                                <p className="text-foreground font-medium leading-tight">{event.description}</p>
                                <Badge className={cn("text-xs px-1.5 py-0.5", event.tagColor)}>{event.tag}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {event.startTime} - {event.endTime}
                            </p>
                          </div>
                      </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                     <p className="text-sm text-muted-foreground">Nenhum evento para hoje.</p>
                  </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
