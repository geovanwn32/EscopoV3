'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Server, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SefazStatus {
  autorizador: string;
  status_autorizador: 'ONLINE' | 'OFFLINE' | 'INSTAVEL';
  tempo_medio: string;
  ultima_verificacao: string;
}

export default function ServiceStatusChecker() {
  const [statuses, setStatuses] = useState<SefazStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://brasilapi.com.br/api/nfe/v1/status');
      if (!response.ok) {
        throw new Error('Não foi possível buscar o status dos serviços.');
      }
      const data: SefazStatus[] = await response.json();
      setStatuses(data);
      setLastUpdated(new Date());
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Conexão',
        description: error.message || 'Falha ao conectar com a API de status.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const filteredStatuses = useMemo(() => {
    return statuses.filter(status =>
      status.autorizador.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.autorizador.localeCompare(b.autorizador));
  }, [statuses, searchTerm]);

  const getStatusBadge = (status: SefazStatus['status_autorizador']) => {
    switch (status) {
      case 'ONLINE':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Wifi className="mr-2 h-3 w-3" />
            Online
          </Badge>
        );
      case 'OFFLINE':
        return (
          <Badge variant="destructive">
            <WifiOff className="mr-2 h-3 w-3" />
            Offline
          </Badge>
        );
      case 'INSTAVEL':
        return (
          <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
            <Server className="mr-2 h-3 w-3" />
            Instável
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Disponibilidade dos Autorizadores</CardTitle>
            <CardDescription>
              {isLoading ? 'Buscando informações...' : `Última atualização: ${lastUpdated?.toLocaleString('pt-BR') || 'N/A'}`}
            </CardDescription>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por estado..." 
                className="pl-9 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchStatus} disabled={isLoading} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Loader2 className="h-4 w-4" />}
              <span className="sr-only">Atualizar</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Autorizador (Estado)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Tempo Médio</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Última Verificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="h-12 animate-pulse bg-muted rounded-md"></TableCell>
                    <TableCell className="animate-pulse bg-muted rounded-md"></TableCell>
                    <TableCell className="hidden sm:table-cell animate-pulse bg-muted rounded-md"></TableCell>
                    <TableCell className="hidden sm:table-cell animate-pulse bg-muted rounded-md"></TableCell>
                  </TableRow>
                ))
              ) : filteredStatuses.length > 0 ? (
                <TooltipProvider>
                  {filteredStatuses.map((status) => (
                    <TableRow key={status.autorizador}>
                      <TableCell className="font-medium">{status.autorizador}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(status.status_autorizador)}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell font-mono">{status.tempo_medio}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <Tooltip>
                            <TooltipTrigger>
                                {new Date(status.ultima_verificacao).toLocaleTimeString('pt-BR')}
                            </TooltipTrigger>
                            <TooltipContent>
                                {new Date(status.ultima_verificacao).toLocaleString('pt-BR')}
                            </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TooltipProvider>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum resultado encontrado para &quot;{searchTerm}&quot;.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
