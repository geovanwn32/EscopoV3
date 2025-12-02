
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, User, Tag, Type } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '@/hooks/use-company';

type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  userAvatar: string;
  action: AuditLogAction;
  module: string;
  details: string;
}

const mockAuditLogs: AuditLog[] = [
    { id: '1', timestamp: new Date('2024-07-30T10:00:00Z'), user: 'Geovani Nunes', userAvatar: '/avatars/01.png', action: 'CREATE', module: 'Parceiros', details: 'Criou o parceiro "Soluções Inovadoras S.A." (CNPJ: 12.345.678/0001-99).' },
    { id: '2', timestamp: new Date('2024-07-30T10:05:00Z'), user: 'Alice', userAvatar: '/avatars/02.png', action: 'LOGIN', module: 'Autenticação', details: 'Login bem-sucedido no sistema.' },
    { id: '3', timestamp: new Date('2024-07-30T11:20:00Z'), user: 'Geovani Nunes', userAvatar: '/avatars/01.png', action: 'IMPORT', module: 'Fiscal', details: 'Importou 5 arquivos XML de NF-e.' },
    { id: '4', timestamp: new Date('2024-07-30T14:15:00Z'), user: 'Carlos', userAvatar: '/avatars/03.png', action: 'UPDATE', module: 'Minha Empresa', details: 'Atualizou o endereço da empresa ativa.' },
    { id: '5', timestamp: new Date('2024-07-30T16:45:00Z'), user: 'Geovani Nunes', userAvatar: '/avatars/01.png', action: 'DELETE', module: 'Parceiros', details: 'Excluiu o parceiro "Fornecedor Antigo".' },
    { id: '6', timestamp: new Date('2024-07-29T09:30:00Z'), user: 'Alice', userAvatar: '/avatars/02.png', action: 'CREATE', module: 'Fiscal', details: 'Lançou nota fiscal de serviço nº 102 para "Cliente XPTO".' },
];


export default function AuditTrailPage() {
    const { useScopedData } = useCompany();
    const [logs, setLogs] = useScopedData<AuditLog[]>('audit-trail-logs', mockAuditLogs);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const searchMatch = searchTerm.length < 2 ||
                log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase());

            const moduleMatch = moduleFilter === 'all' || log.module === moduleFilter;
            const actionMatch = actionFilter === 'all' || log.action === actionFilter;

            return searchMatch && moduleMatch && actionMatch;
        });
    }, [logs, searchTerm, moduleFilter, actionFilter]);

    const getBadgeVariant = (action: AuditLogAction) => {
        switch (action) {
            case 'CREATE':
            case 'IMPORT':
                return 'default';
            case 'UPDATE':
                return 'secondary';
            case 'DELETE':
                return 'destructive';
            case 'LOGIN':
                return 'outline';
            default:
                return 'secondary';
        }
    }

    const uniqueModules = ['all', ...Array.from(new Set(logs.map(log => log.module)))];
    const uniqueActions = ['all', ...Array.from(new Set(logs.map(log => log.action)))];

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Trilha de Auditoria</h1>
                <p className="text-muted-foreground">
                    Acompanhe as mudanças, ações de usuários e modificações de dados no sistema.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registros de Atividade</CardTitle>
                    <CardDescription>Visualize os eventos recentes que ocorreram no sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por usuário, módulo ou detalhes..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className='flex gap-4'>
                            <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Tag className="mr-2 h-4 w-4 text-muted-foreground"/>
                                    <SelectValue placeholder="Módulo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueModules.map(mod => (
                                        <SelectItem key={mod} value={mod}>{mod === 'all' ? 'Todos os Módulos' : mod}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Type className="mr-2 h-4 w-4 text-muted-foreground"/>
                                    <SelectValue placeholder="Ação" />
                                </SelectTrigger>
                                <SelectContent>
                                     {uniqueActions.map(act => (
                                        <SelectItem key={act} value={act}>{act === 'all' ? 'Todas as Ações' : act}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[180px]'>Data/Hora</TableHead>
                                    <TableHead className='w-[200px]'>Usuário</TableHead>
                                    <TableHead className='w-[150px]'>Módulo</TableHead>
                                    <TableHead className='w-[120px]'>Ação</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {log.timestamp.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })}
                                            </TableCell>
                                            <TableCell className="font-medium">{log.user}</TableCell>
                                            <TableCell>{log.module}</TableCell>
                                            <TableCell>
                                                <Badge variant={getBadgeVariant(log.action)}>{log.action}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{log.details}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Nenhum registro encontrado com os filtros atuais.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
