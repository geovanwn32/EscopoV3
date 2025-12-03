
'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/use-company';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { AuditLog, logAudit } from '@/lib/audit-log';

interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
    isMaster?: boolean;
    permissions: { [key: string]: boolean };
    allowedCompanyIds: number[];
    password?: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
}

export default function AdminPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [users, setUsers] = useScopedData<User[]>('global-users', []);
    const [, setAuditLogs] = useScopedData<AuditLog[]>('audit-trail-logs', []);


    const pendingUsers = useMemo(() => {
        return users.filter(user => user.status === 'Pendente');
    }, [users]);
    
    const handleApproval = (userId: number, approve: boolean) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        if (approve) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Ativo' } : u));
            toast({
                title: "Usuário Aprovado!",
                description: `${user.name} agora tem acesso ao sistema.`
            });
            logAudit(setAuditLogs, 'UPDATE', 'Admin', `Aprovou o usuário "${user.name}".`);

        } else {
            // Rejeitar significa excluir o usuário pendente
            setUsers(prev => prev.filter(u => u.id !== userId));
            toast({
                variant: 'destructive',
                title: "Usuário Recusado",
                description: `A solicitação de acesso de ${user.name} foi recusada.`
            });
             logAudit(setAuditLogs, 'DELETE', 'Admin', `Recusou o usuário "${user.name}".`);
        }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários pendentes, licenças e configurações do sistema.
          </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Logins Pendentes de Aprovação</CardTitle>
                <CardDescription>Abaixo estão os usuários que solicitaram acesso e aguardam sua liberação.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[180px] text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingUsers.length > 0 ? pendingUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{user.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Button size="sm" variant="outline" className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleApproval(user.id, false)}>
                                            <X className="mr-2 h-4 w-4"/>
                                            Recusar
                                        </Button>
                                         <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleApproval(user.id, true)}>
                                            <Check className="mr-2 h-4 w-4"/>
                                            Aprovar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Nenhum usuário pendente de aprovação.
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
