
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalStorage, type Company } from '@/hooks/use-company';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar as CalendarIcon, Shield, User as UserIcon, RefreshCw, Search, MoreHorizontal, Pencil, Trash2, Crown, Building, Briefcase, Upload, Users, Clock, FileWarning, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Image as ImageIcon, LayoutGrid, FileType } from 'lucide-react';
import { AuditLog, logAudit } from '@/lib/audit-log';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const modules = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'fiscal', label: 'Fiscal' },
    { id: 'pessoal', label: 'Pessoal' },
    { id: 'contabil', label: 'Contábil' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'cadastros', label: 'Cadastros' },
    { id: 'conectividade', label: 'Conectividade' },
    { id: 'utilitarios', label: 'Utilitários' },
];


interface UserPermissions {
    [key: string]: boolean;
}

interface User {
    id: number;
    uid?: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isMaster?: boolean;
    permissions: UserPermissions;
    allowedCompanyIds: number[];
    password?: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
    creationDate?: string; // ISO string
    dataExpiracaoLicenca?: string; // ISO string
    planoId?: 'Gratuito' | 'Basico' | 'Profissional' | 'Empresarial';
    statusLicenca?: 'Ativa' | 'Inadimplente' | 'Cancelada' | 'Expirada';
    photoURL?: string;
}

type SortKey = keyof User | 'licenca' | 'criacao';

const adminTools = [
    { id: 'geral', label: 'Visão Geral', icon: LayoutGrid, href: '/admin' },
    { id: 'media', label: 'Gerenciador de Mídia', icon: ImageIcon, href: '/admin/gerenciador-de-midia' },
]

export default function AdminPage() {
    const { toast } = useToast();
    const [users, setUsers] = useLocalStorage<User[]>('global-users', []);
    const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('audit-trail-logs', []);
    const { user: firebaseUser } = useUser();
    const [companies] = useLocalStorage<Company[]>('companies', []);
    
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeProfile, setActiveProfile] = useState<User | null>(null);

    // State for advanced controls
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);


     useEffect(() => {
        if (firebaseUser) {
            const profileString = sessionStorage.getItem('user-profile');
            if (profileString) {
                try {
                    setActiveProfile(JSON.parse(profileString));
                } catch (e) { console.error("Failed to parse profile", e); }
            }
        }
    }, [firebaseUser]);

    const kpiData = useMemo(() => {
        const totalUsers = users.length;
        const pendingUsers = users.filter(u => u.status === 'Pendente').length;
        const activeLicenses = users.filter(u => u.statusLicenca === 'Ativa').length;
        const expiringSoon = users.filter(u => u.dataExpiracaoLicenca && new Date(u.dataExpiracaoLicenca) <= addDays(new Date(), 7)).length;
        return { totalUsers, pendingUsers, activeLicenses, expiringSoon };
    }, [users]);
    

    // Filter out the master user from the list displayed
    const filteredAndSortedUsers = useMemo(() => {
        const nonMasterUsers = users.filter(user => !user.isMaster);
        
        let filtered = nonMasterUsers.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'all' || user.status === statusFilter;
            const planMatch = planFilter === 'all' || user.planoId === planFilter;
            return searchMatch && statusMatch && planMatch;
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'licenca') {
                    aValue = a.dataExpiracaoLicenca ? new Date(a.dataExpiracaoLicenca).getTime() : 0;
                    bValue = b.dataExpiracaoLicenca ? new Date(b.dataExpiracaoLicenca).getTime() : 0;
                } else if (sortConfig.key === 'criacao') {
                     aValue = a.creationDate ? new Date(a.creationDate).getTime() : 0;
                     bValue = b.creationDate ? new Date(b.creationDate).getTime() : 0;
                } else {
                    aValue = a[sortConfig.key as keyof User];
                    bValue = b[sortConfig.key as keyof User];
                }

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return filtered;

    }, [users, searchTerm, statusFilter, planFilter, sortConfig]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredAndSortedUsers.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredAndSortedUsers, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedUsers.length / rowsPerPage);

    const handleSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
     const handleSaveUserEdit = (itemData: Omit<User, 'id'>) => {
        if (!userToEdit) return;

        const originalUser = users.find(u => u.id === userToEdit.id);
        const isApprovalFlow = originalUser?.status === 'Pendente';
        
        const updatedUser: User = { ...userToEdit, ...itemData };
        if (!itemData.password) {
            delete updatedUser.password;
        }
        
        if (isApprovalFlow) {
            updatedUser.status = 'Ativo';
            if (!updatedUser.dataExpiracaoLicenca) {
                updatedUser.dataExpiracaoLicenca = addDays(new Date(), 30).toISOString();
            }
        }

        setUsers(prev => prev.map(user => user.id === userToEdit.id ? updatedUser : user));
        
        setUserToEdit(null);

        if (isApprovalFlow) {
            toast({ title: "Usuário Aprovado!", description: `O acesso para ${updatedUser.name} foi liberado.` });
            logAudit(setAuditLogs, 'UPDATE', 'Admin', `Aprovou o usuário "${updatedUser.name}".`);
        } else {
            toast({ title: "Usuário Atualizado!", description: "Os dados do usuário foram atualizados." });
            let logDetails = `Atualizou o usuário "${itemData.name}".`;

            if (originalUser && !originalUser.isMaster && updatedUser.isMaster) {
                logAudit(setAuditLogs, 'UPDATE', 'Usuários', `O usuário "${itemData.name}" tornou-se Master.`);
            }
            logAudit(setAuditLogs, 'UPDATE', 'Admin', logDetails);
        }
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
        
        if (userToDelete.isMaster) {
             toast({
                variant: 'destructive',
                title: 'Ação não permitida',
                description: 'Não é possível excluir o perfil Master.',
            });
            setUserToDelete(null);
            return;
        }
        if (userToDelete.isAdmin && users.filter(u => u.isAdmin).length <= 1) {
             toast({
                variant: 'destructive',
                title: 'Ação não permitida',
                description: 'Não é possível excluir o único perfil de administrador.',
            });
            setUserToDelete(null);
            return;
        }

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

    const handleBulkAction = (action: 'approve' | 'reject') => {
        if (selectedUserIds.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum usuário selecionado' });
            return;
        }

        if (action === 'approve') {
            setUsers(prev => prev.map(user => {
                if (selectedUserIds.includes(user.id) && user.status === 'Pendente') {
                    return { 
                        ...user, 
                        status: 'Ativo', 
                        dataExpiracaoLicenca: user.dataExpiracaoLicenca || addDays(new Date(), 30).toISOString() 
                    };
                }
                return user;
            }));
            toast({ title: "Usuários Aprovados", description: `${selectedUserIds.length} usuários foram aprovados.` });
        } else if (action === 'reject') {
            setUsers(prev => prev.filter(user => !selectedUserIds.includes(user.id)));
            toast({ variant: 'destructive', title: "Usuários Recusados", description: `${selectedUserIds.length} solicitações foram recusadas.` });
        }

        setSelectedUserIds([]);
    };
    
    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(paginatedUsers.map(u => u.id));
        } else {
            setSelectedUserIds([]);
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

        <Tabs defaultValue="geral">
            <TabsList>
                {adminTools.map(tool => (
                    <TabsTrigger key={tool.id} value={tool.id} asChild>
                       <Link href={tool.href}>
                         <tool.icon className="mr-2 h-4 w-4" /> {tool.label}
                       </Link>
                    </TabsTrigger>
                ))}
            </TabsList>
            
            <TabsContent value="geral" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{kpiData.totalUsers}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Acessos Pendentes</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{kpiData.pendingUsers}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Licenças Ativas</CardTitle>
                            <Check className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{kpiData.activeLicenses}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Licenças a Expirar</CardTitle>
                            <FileWarning className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{kpiData.expiringSoon}</div></CardContent>
                    </Card>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Gerenciamento de Usuários</CardTitle>
                                <CardDescription>{filteredAndSortedUsers.length} usuários encontrados.</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="Pendente">Pendente</SelectItem>
                                        <SelectItem value="Ativo">Ativo</SelectItem>
                                        <SelectItem value="Inativo">Inativo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={planFilter} onValueChange={setPlanFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Planos</SelectItem>
                                        <SelectItem value="Gratuito">Gratuito</SelectItem>
                                        <SelectItem value="Basico">Básico</SelectItem>
                                        <SelectItem value="Profissional">Profissional</SelectItem>
                                        <SelectItem value="Empresarial">Empresarial</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={handleRefresh}>
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Atualizar</span>
                                </Button>
                            </div>
                        </div>
                        {selectedUserIds.length > 0 && (
                            <div className="flex items-center gap-2 mt-4 border-t pt-4">
                                <span className="text-sm text-muted-foreground">{selectedUserIds.length} selecionado(s)</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline">Ações em Lote <ArrowUpDown className="ml-2 h-4 w-4"/></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => handleBulkAction('approve')} className="text-emerald-600 focus:text-emerald-700">Aprovar Selecionados</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleBulkAction('reject')} className="text-destructive focus:text-destructive">Recusar Selecionados</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"><Checkbox onCheckedChange={toggleSelectAll} checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0} /></TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                            <div className='flex items-center gap-2'>Nome <ArrowUpDown className="h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Plano Solicitado</TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('criacao')}>
                                            <div className='flex items-center gap-2'>Data de Criação <ArrowUpDown className="h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('licenca')}>
                                            <div className='flex items-center gap-2'>Licença Expira em <ArrowUpDown className="h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead className="w-[100px] text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                                        <TableRow key={user.id} className={user.status === 'Pendente' ? 'bg-muted/50' : ''} data-state={selectedUserIds.includes(user.id) && "selected"}>
                                            <TableCell><Checkbox checked={selectedUserIds.includes(user.id)} onCheckedChange={(checked) => setSelectedUserIds(prev => checked ? [...prev, user.id] : prev.filter(id => id !== user.id))} /></TableCell>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                {user.isMaster ? <Crown className='h-4 w-4 text-amber-500' /> : user.isAdmin ? <Shield className='h-4 w-4 text-primary' /> : <UserIcon className='h-4 w-4 text-muted-foreground' />}
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.planoId ? <Badge variant="outline" className='flex items-center gap-1.5'><Briefcase className='h-3 w-3'/> {user.planoId}</Badge> : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {user.creationDate ? format(new Date(user.creationDate), 'dd/MM/yyyy') : 'N/A'}
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
                                                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setUserToEdit(user)}>
                                                            <Pencil className="mr-2 h-4 w-4"/>
                                                            Revisar
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
                                                            <DropdownMenuItem onClick={() => setUserToEdit(user)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Editar
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
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                Nenhum usuário encontrado com os filtros atuais.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <div className="text-sm text-muted-foreground">
                                {selectedUserIds.length} de {filteredAndSortedUsers.length} linha(s) selecionada(s).
                            </div>
                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium">Linhas por página</p>
                                    <Select
                                        value={`${rowsPerPage}`}
                                        onValueChange={(value) => {
                                        setRowsPerPage(Number(value))
                                        setCurrentPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={rowsPerPage} />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                        {[5, 10, 20, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Página {currentPage} de {totalPages}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        {activeProfile && <UserEditDialog 
            open={!!userToEdit}
            onOpenChange={(open) => {if(!open) setUserToEdit(null)}}
            item={userToEdit}
            onSave={handleSaveUserEdit}
            users={users}
            activeProfile={activeProfile}
            allCompanies={companies}
        />}

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


interface UserEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (item: Omit<User, 'id'>) => void;
    item: User | null;
    users: User[];
    activeProfile: User;
    allCompanies: Company[];
}

const initialPermissions: UserPermissions = modules.reduce((acc, module) => {
    acc[module.id] = false;
    return acc;
}, {} as UserPermissions);


const initialFormState: Omit<User, 'id'> = {
    name: '',
    email: '',
    uid: '',
    password: '',
    isAdmin: false,
    isMaster: false,
    permissions: initialPermissions,
    allowedCompanyIds: [],
    status: 'Ativo',
    planoId: 'Gratuito',
    statusLicenca: 'Ativa',
    dataExpiracaoLicenca: '',
    photoURL: '',
};

function UserEditDialog({ open, onOpenChange, item, onSave, users, activeProfile, allCompanies }: UserEditDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormState);

    const otherAdminExists = useMemo(() => {
        return users.some(user => user.isAdmin && user.id !== item?.id);
    }, [users, item]);

    const otherMasterExists = useMemo(() => {
        return users.some(user => user.isMaster && user.id !== item?.id);
    }, [users, item]);

    useEffect(() => {
        if (item) {
            setFormData({
                uid: item.uid || '',
                name: item.name || '',
                email: item.email || '',
                password: '',
                isAdmin: item.isAdmin || false,
                isMaster: item.isMaster || false,
                permissions: item.permissions || initialPermissions,
                allowedCompanyIds: item.allowedCompanyIds || [],
                status: item.status || 'Ativo',
                planoId: item.planoId || 'Gratuito',
                statusLicenca: item.statusLicenca || 'Ativa',
                dataExpiracaoLicenca: item.dataExpiracaoLicenca || '',
                photoURL: item.photoURL || '',
            });
        } else {
            setFormData(initialFormState);
        }
    }, [item]);

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handlePermissionChange = (permission: string, isChecked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: isChecked,
            }
        }))
    };

    const handleCompanyAccessChange = (companyId: number, isChecked: boolean) => {
        setFormData(prev => {
            const currentIds = prev.allowedCompanyIds || [];
            if (isChecked) {
                return { ...prev, allowedCompanyIds: [...currentIds, companyId] };
            } else {
                return { ...prev, allowedCompanyIds: currentIds.filter(id => id !== companyId) };
            }
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                handleInputChange('photoURL', base64String);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha o nome e o e-mail.'
            });
            return;
        }
        
        onSave(formData);
    };
    
    const isEditingSelf = item?.id === activeProfile.id;
    const isApprovalFlow = item?.status === 'Pendente';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{isApprovalFlow ? 'Revisar e Aprovar Usuário' : (item ? 'Editar' : 'Convidar') + ' Usuário'}</DialogTitle>
                    <DialogDescription>{isApprovalFlow ? 'Revise os dados, defina a licença e aprove o acesso do usuário.' : 'Preencha os dados e defina o perfil de acesso do usuário.'}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={formData.photoURL} alt={formData.name} />
                            <AvatarFallback>
                                <UserIcon className="h-12 w-12 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <Button asChild variant="outline" size="sm">
                            <label htmlFor="photo-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" /> Alterar Foto
                                <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                            </label>
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{item ? 'Nova Senha' : 'Senha'}</Label>
                        <Input id="password" type="password" value={formData.password || ''} onChange={(e) => handleInputChange('password', e.target.value)} placeholder={item ? "Deixe em branco para não alterar" : "Senha de acesso"} required={!item}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="planoId">Plano Contratado</Label>
                            <Select value={formData.planoId} onValueChange={(value) => handleInputChange('planoId', value)}>
                                <SelectTrigger id="planoId"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gratuito">Gratuito</SelectItem>
                                    <SelectItem value="Basico">Básico</SelectItem>
                                    <SelectItem value="Profissional">Profissional</SelectItem>
                                    <SelectItem value="Empresarial">Empresarial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="statusLicenca">Status da Licença</Label>
                                <Select value={formData.statusLicenca} onValueChange={(value) => handleInputChange('statusLicenca', value)}>
                                <SelectTrigger id="statusLicenca"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ativa">Ativa</SelectItem>
                                    <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                                    <SelectItem value="Expirada">Expirada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dataVencimento">Data de Vencimento da Licença</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="dataVencimento"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !formData.dataExpiracaoLicenca && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.dataExpiracaoLicenca ? format(new Date(formData.dataExpiracaoLicenca), "PPP", { locale: ptBR }) : <span>Escolha a data de expiração</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 flex flex-col space-y-2">
                                <div className="p-2 border-b">
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleInputChange('dataExpiracaoLicenca', addMonths(new Date(), 1).toISOString())}>1 Mês</Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleInputChange('dataExpiracaoLicenca', addMonths(new Date(), 6).toISOString())}>6 Meses</Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleInputChange('dataExpiracaoLicenca', addYears(new Date(), 1).toISOString())}>1 Ano</Button>
                                    </div>
                                </div>
                                <Calendar 
                                    mode="single" 
                                    selected={formData.dataExpiracaoLicenca ? new Date(formData.dataExpiracaoLicenca) : undefined} 
                                    onSelect={(date) => handleInputChange('dataExpiracaoLicenca', date ? date.toISOString() : '')} 
                                    initialFocus 
                                    locale={ptBR} 
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Separator />

                    {activeProfile.isMaster && (
                        <>
                        <div className="space-y-2 flex items-center justify-between rounded-lg border p-3 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
                            <div className='space-y-0.5'>
                                <Label htmlFor="isMasterSwitch" className='flex items-center text-amber-900 dark:text-amber-300'><Crown className='mr-2 h-4 w-4' />Perfil Master</Label>
                                <p className='text-xs text-amber-700 dark:text-amber-500'>
                                    Concede acesso irrestrito e impede a própria exclusão.
                                </p>
                            </div>
                            <Switch
                                id="isMasterSwitch"
                                checked={formData.isMaster}
                                onCheckedChange={(checked) => handleInputChange('isMaster', checked)}
                                disabled={isEditingSelf && !otherMasterExists}
                            />
                        </div>
                        <div className="space-y-2 flex items-center justify-between rounded-lg border p-3">
                            <div className='space-y-0.5'>
                                <Label htmlFor="isAdmin" className='flex items-center'><Shield className='mr-2 h-4 w-4 text-primary' />Perfil de Administrador</Label>
                                <p className='text-xs text-muted-foreground'>
                                    Concede acesso total a todos os módulos e empresas.
                                </p>
                            </div>
                            <Switch
                                id="isAdmin"
                                checked={formData.isAdmin}
                                onCheckedChange={(checked) => handleInputChange('isAdmin', checked)}
                                disabled={item?.isMaster || (isEditingSelf && !otherAdminExists)}
                            />
                        </div>
                        </>
                    )}

                    {!formData.isAdmin && !formData.isMaster && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <Label className="flex items-center"><Building className="mr-2 h-4 w-4" /> Acesso às Empresas</Label>
                                <div className="max-h-32 overflow-y-auto space-y-2 rounded-md border p-2">
                                    {allCompanies.map(company => (
                                        <div key={company.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`company-${company.id}`}
                                                checked={formData.allowedCompanyIds?.includes(company.id)}
                                                onCheckedChange={(checked) => handleCompanyAccessChange(company.id, !!checked)}
                                            />
                                            <label htmlFor={`company-${company.id}`} className="text-sm font-medium leading-none">
                                                {company.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <Label className="flex items-center"><Shield className="mr-2 h-4 w-4" /> Permissões de Módulo</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 rounded-md border p-4">
                                    {modules.map(module => (
                                        <div key={module.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`perm-${module.id}`}
                                                checked={formData.permissions?.[module.id] || false}
                                                onCheckedChange={(checked) => handlePermissionChange(module.id, !!checked)}
                                            />
                                            <label htmlFor={`perm-${module.id}`} className="text-sm font-medium leading-none">
                                                {module.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}


                    <div className="space-y-2 flex items-center justify-between rounded-lg border p-3">
                        <div className='space-y-0.5'>
                            <Label htmlFor="status" className='flex items-center'>Status do Usuário</Label>
                            <p className='text-xs text-muted-foreground'>
                            Usuários inativos não podem acessar o sistema.
                            </p>
                        </div>
                        <Switch
                            id="status"
                            checked={formData.status === 'Ativo'}
                            onCheckedChange={(checked) => handleInputChange('status', checked ? 'Ativo' : 'Inativo')}
                            disabled={isEditingSelf && (formData.isAdmin || !!formData.isMaster)}
                        />
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">{isApprovalFlow ? 'Aprovar Usuário' : 'Salvar'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

    

    
