
'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-company';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar as CalendarIcon, Shield, User, RefreshCw, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { AuditLog, logAudit } from '@/lib/audit-log';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


interface User {
    id: number;
    uid: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isMaster?: boolean;
    permissions: { [key: string]: boolean };
    allowedCompanyIds: number[];
    password?: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
    creationDate?: string; // ISO string
    dataExpiracaoLicenca?: string; // ISO string
}

export default function AdminPage() {
    const { toast } = useToast();
    const [users, setUsers] = useLocalStorage<User[]>('global-users', []);
    const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('audit-trail-logs', []);
    
    const [userToManage, setUserToManage] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter out the master user from the list displayed
    const displayUsers = useMemo(() => {
        return users.filter(user => 
            !user.isMaster &&
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (a.status === 'Pendente' && b.status !== 'Pendente') return -1;
            if (a.status !== 'Pendente' && b.status === 'Pendente') return 1;
            return new Date(b.creationDate || 0).getTime() - new Date(a.creationDate || 0).getTime();
        });
    }, [users, searchTerm]);
    
    const handleLicenseUpdate = (userId: number, expiryDate: Date) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const isApproval = user.status === 'Pendente';

        setUsers(prev => prev.map(u => 
            u.id === userId 
            ? { ...u, status: 'Ativo', dataExpiracaoLicenca: expiryDate.toISOString() } 
            : u
        ));
        
        toast({
            title: isApproval ? "Usuário Aprovado!" : "Licença Atualizada!",
            description: `${user.name} agora tem acesso ao sistema até ${format(expiryDate, 'dd/MM/yyyy')}.`
        });

        const logDetails = isApproval
            ? `Aprovou o usuário "${user.name}" com licença até ${format(expiryDate, 'dd/MM/yyyy')}.`
            : `Atualizou a licença do usuário "${user.name}" para ${format(expiryDate, 'dd/MM/yyyy')}.`;
        
        logAudit(setAuditLogs, 'UPDATE', 'Admin', logDetails);
        setUserToManage(null);
    };

    const handleRejection = (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({
            variant: 'destructive',
            title: "Usuário Recusado",
            description: `A solicitação de acesso de ${user.name} foi recusada.`
        });
        logAudit(setAuditLogs, 'DELETE', 'Admin', `Recusou o usuário "${user.name}".`);
    }

    const handleDeleteUser = () => {
        if (!userToDelete) return;

        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        toast({
            variant: 'destructive',
            title: "Usuário Excluído",
            description: `O usuário ${userToDelete.name} foi excluído permanentemente.`
        });
        logAudit(setAuditLogs, 'DELETE', 'Admin', `Excluiu o usuário "${userToDelete.name}".`);
        setUserToDelete(null);
    }
    
    const handleRefresh = () => {
        window.location.reload();
    }

    const getStatusBadge = (status: User['status']) => {
        switch (status) {
            case 'Ativo':
                return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600"><Check className="mr-1 h-3 w-3"/>Ativo</Badge>;
            case 'Inativo':
                return <Badge variant="destructive">Inativo</Badge>;
            case 'Pendente':
                return <Badge variant="secondary">Pendente</Badge>;
            default:
                return <Badge variant="outline">Desconhecido</Badge>;
        }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, aprove solicitações e controle as licenças de acesso ao sistema.
          </p>
        </div>
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Gerenciamento de Usuários</CardTitle>
                        <CardDescription>Abaixo estão todos os usuários do sistema. Aprove os pendentes e gerencie os ativos.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Button variant="outline" size="icon" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4" />
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
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>UID Firebase</TableHead>
                                <TableHead>Data Criação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Licença Expira em</TableHead>
                                <TableHead className="w-[180px] text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayUsers.length > 0 ? displayUsers.map(user => (
                                <TableRow key={user.id} className={user.status === 'Pendente' ? 'bg-muted/50' : ''}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {user.isAdmin ? <Shield className='h-4 w-4 text-primary' /> : <User className='h-4 w-4 text-muted-foreground' />}
                                        {user.name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{user.uid || 'N/A'}</TableCell>
                                    <TableCell>
                                        {user.creationDate ? format(new Date(user.creationDate), 'dd/MM/yyyy HH:mm') : 'N/A'}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell>
                                        {user.dataExpiracaoLicenca ? format(new Date(user.dataExpiracaoLicenca), 'dd/MM/yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {user.status === 'Pendente' ? (
                                            <div className="space-x-2">
                                                <Button size="sm" variant="outline" className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleRejection(user.id)}>
                                                    <X className="mr-2 h-4 w-4"/>
                                                    Recusar
                                                </Button>
                                                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setUserToManage(user)}>
                                                    <Check className="mr-2 h-4 w-4"/>
                                                    Aprovar
                                                </Button>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Ações</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => toast({title: "Em desenvolvimento", description: "Função de edição de usuário em breve."})}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setUserToManage(user)}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" /> Gerenciar Licença
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setUserToDelete(user)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Nenhum usuário para gerenciar no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <LicenseManagementDialog 
            user={userToManage}
            onOpenChange={() => setUserToManage(null)}
            onConfirm={handleLicenseUpdate}
        />

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O usuário <span className="font-bold">{userToDelete?.name}</span> será permanentemente excluído.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser}>Confirmar Exclusão</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
    );
}

interface LicenseManagementDialogProps {
    user: User | null;
    onOpenChange: () => void;
    onConfirm: (userId: number, expiryDate: Date) => void;
}

function LicenseManagementDialog({ user, onOpenChange, onConfirm }: LicenseManagementDialogProps) {
    const [period, setPeriod] = useState<string>('30');
    const [customDate, setCustomDate] = useState<Date | undefined>();

    const calculateExpiryDate = (): Date => {
        if (period === 'custom' && customDate) {
            return customDate;
        }
        const days = parseInt(period, 10);
        return addDays(new Date(), days);
    }
    
    const handleConfirm = () => {
        if (!user) return;
        const expiryDate = calculateExpiryDate();
        onConfirm(user.id, expiryDate);
    }
    
    const isApprovalFlow = user && user.status === 'Pendente';

    return (
        <Dialog open={!!user} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isApprovalFlow ? "Aprovar Usuário e Definir Licença" : "Gerenciar Licença"}</DialogTitle>
                    <DialogDescription>
                        Defina o período de validade da licença para <span className="font-bold">{user?.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="license-period">Período da Licença</Label>
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger id="license-period">
                                <SelectValue placeholder="Selecione o período..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 dias</SelectItem>
                                <SelectItem value="60">60 dias</SelectItem>
                                <SelectItem value="90">90 dias</SelectItem>
                                <SelectItem value="365">1 ano</SelectItem>
                                <SelectItem value="custom">Data Personalizada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {period === 'custom' && (
                        <div className="space-y-2">
                             <Label htmlFor="custom-date">Data de Expiração</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="custom-date"
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !customDate && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {customDate ? format(customDate, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={customDate}
                                        onSelect={setCustomDate}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onOpenChange}>Cancelar</Button>
                    <Button onClick={handleConfirm}>{isApprovalFlow ? "Confirmar Aprovação" : "Atualizar Licença"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
