
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useCompany, useLocalStorage } from '@/hooks/use-company';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar as CalendarIcon, Shield, User as UserIcon, RefreshCw, Search, MoreHorizontal, Pencil, Trash2, Crown, Building, Briefcase } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/firebase';


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
}

export default function AdminPage() {
    const { toast } = useToast();
    const { companies } = useCompany();
    const [users, setUsers] = useLocalStorage<User[]>('global-users', []);
    const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('audit-trail-logs', []);
    const { user: firebaseUser } = useUser();
    
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeProfile, setActiveProfile] = useState<User | null>(null);

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
                                <TableHead>Plano Solicitado</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Licença Expira em</TableHead>
                                <TableHead className="w-[180px] text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayUsers.length > 0 ? displayUsers.map(user => (
                                <TableRow key={user.id} className={user.status === 'Pendente' ? 'bg-muted/50' : ''}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {user.isAdmin ? <Shield className='h-4 w-4 text-primary' /> : <UserIcon className='h-4 w-4 text-muted-foreground' />}
                                        {user.name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                     <TableCell>
                                        {user.planoId ? <Badge variant="outline" className='flex items-center gap-1.5'><Briefcase className='h-3 w-3'/> {user.planoId}</Badge> : 'N/A'}
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

        {activeProfile && <UserEditDialog 
            open={!!userToEdit}
            onOpenChange={(open) => {if(!open) setUserToEdit(null)}}
            item={userToEdit}
            onSave={handleSaveUserEdit}
            users={users}
            activeProfile={activeProfile}
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
    dataExpiracaoLicenca: ''
};

function UserEditDialog({ open, onOpenChange, item, onSave, users, activeProfile }: UserEditDialogProps) {
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
                dataExpiracaoLicenca: item.dataExpiracaoLicenca || ''
            });
        } else {
            setFormData(initialFormState);
        }
    }, [item]);

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isApprovalFlow ? 'Revisar e Aprovar Usuário' : (item ? 'Editar' : 'Convidar') + ' Usuário'}</DialogTitle>
                    <DialogDescription>{isApprovalFlow ? 'Revise os dados, defina a licença e aprove o acesso do usuário.' : 'Preencha os dados e defina o perfil de acesso do usuário.'}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <PopoverContent className="w-auto p-0">
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

                    {activeProfile.isAdmin && isEditingSelf && (
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
                                disabled={otherMasterExists}
                            />
                        </div>
                    )}
                    {activeProfile.isMaster && (
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
                                disabled={item?.isMaster || (item?.isAdmin && !otherAdminExists)}
                            />
                        </div>
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
    

    

    

    
