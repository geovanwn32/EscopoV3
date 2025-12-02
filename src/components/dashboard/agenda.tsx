'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Os eventos agora devem vir de um estado ou API
const events: { date: string; description: string }[] = [];

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Agenda</CardTitle>
            <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2"/>
                Novo Evento
            </Button>
        </div>
        <CardDescription>Eventos e vencimentos importantes.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-4">
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-3"
            classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent/50 text-accent-foreground",
            }}
          />
        </div>
        <div className="flex-grow">
            <h3 className="text-sm font-medium mb-2">Próximos Eventos</h3>
            <div className="space-y-2">
                {events.length > 0 ? (
                  events.map((event) => (
                      <div key={event.date} className="flex items-center text-sm p-2 rounded-md bg-secondary">
                          <div className="font-semibold text-primary mr-2">{new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short'})}</div>
                          <div className="text-secondary-foreground">{event.description}</div>
                      </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento agendado.</p>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
