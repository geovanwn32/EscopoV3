
'use client';
import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, ArrowLeft, ShieldCheck, ShieldAlert, Building, KeyRound, User as UserIcon, Save, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCompany } from '@/hooks/use-company';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AuditLog, logAudit } from '@/lib/audit-log';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    name: string;
    email: string;
    isAdmin: boolean;
    isMaster?: boolean;
    permissions: UserPermissions;
    allowedCompanyIds: number[];
    password?: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
    planoId?: 'Gratuito' | 'Basico' | 'Profissional';
    statusLicenca?: 'Ativa' | 'Inadimplente' | 'Cancelada' | 'Expirada';
}

export default function UsuariosPage() {
    const { toast } = useToast();
    const { useScopedData, companies, currentCompany } = useCompany();
    const [users, setUsers] = useScopedData<User[]>('global-users', []);
    const [, setAuditLogs] = useScopedData<AuditLog[]>('audit-trail-logs', []);
    
    const { user: firebaseUser } = useUser();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<User | null>(null);
    const [editingItem, setEditingItem] = useState<User | null>(null);
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

    const handleSave = (itemData: Omit<User, 'id'>) => {
        const action = editingItem ? 'UPDATE' : 'CREATE';
        let logDetails = '';

        if (editingItem) {
            const originalUser = users.find(u => u.id === editingItem.id);
            const updatedUser = { ...editingItem, ...itemData };
            if (!itemData.password) {
                delete updatedUser.password;
            }
            
            setUsers(prev => prev.map(user => user.id === editingItem.id ? updatedUser : user));
            toast({ title: "Usuário Atualizado!", description: "Os dados do usuário foram atualizados." });

            logDetails = `Atualizou o usuário "${itemData.name}".`;

            if (originalUser && !originalUser.isMaster && updatedUser.isMaster) {
                logAudit(setAuditLogs, 'UPDATE', 'Usuários', `O usuário "${itemData.name}" tornou-se Master.`);
            }

        } else {
            const newItem: User = { ...itemData, id: Date.now() };
            setUsers(prev => [...prev, newItem]);
            toast({ title: "Usuário Adicionado!", description: "Um novo usuário foi convidado para a empresa." });
            logDetails = `Criou o usuário "${itemData.name}" (${itemData.email}).`;
        }

        logAudit(setAuditLogs, action, 'Usuários', logDetails);

        setIsDialogOpen(false);
        setEditingItem(null);
    };


    const handleDeleteClick = (item: User) => {
        if (item.isMaster) {
             toast({
                variant: 'destructive',
                title: 'Ação não permitida',
                description: 'Não é possível excluir o perfil Master.',
            });
            return;
        }
        if (item.isAdmin && users.filter(u => u.isAdmin && !u.isMaster).length <= 1 && users.some(u => u.isMaster)) {
             toast({
                variant: 'destructive',
                title: 'Ação não permitida',
                description: 'Não é possível excluir o único perfil de administrador.',
            });
            return;
        }
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setUsers(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Usuário Removido!", description: `O acesso do usuário foi removido.` });
            logAudit(setAuditLogs, 'DELETE', 'Usuários', `Removeu o usuário "${itemToDelete.name}".`);
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: User) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleNewUserClick = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    }
    
    const handleMyProfileSave = (newPassword: string) => {
        if (!activeProfile) return;

        const updatedProfile = { ...activeProfile, password: newPassword };
        setUsers(prev => prev.map(u => u.id === activeProfile.id ? updatedProfile : u));

        sessionStorage.setItem('user-profile', JSON.stringify(updatedProfile));

        toast({ title: "Senha Atualizada!", description: "Sua senha de acesso foi alterada com sucesso." });
        logAudit(setAuditLogs, 'UPDATE', 'Meu Perfil', 'Alterou a própria senha.');
    };


    const filteredItems = useMemo(() => {
        return users.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [users, searchTerm]);

    const renderPermissions = (user: User) => {
        if (user.isMaster) {
            return <Badge><Crown className="mr-1 h-3 w-3" /> Master</Badge>;
        }
        if (user.isAdmin) {
            return <Badge>Administrador</Badge>;
        }
        const grantedModules = Object.entries(user.permissions || {})
            .filter(([, hasAccess]) => hasAccess)
            .map(([key]) => modules.find(m => m.id === key)?.label)
            .filter(Boolean);

        if (grantedModules.length === 0) {
            return <Badge variant="secondary">Nenhuma Permissão</Badge>
        }

        if (grantedModules.length > 2) {
             return <Badge variant="secondary">{grantedModules.slice(0, 2).join(', ')} + {grantedModules.length - 2}</Badge>
        }

        return <Badge variant="secondary">{grantedModules.join(', ')}</Badge>
    }

    if (!activeProfile) {
        return (
            <div className="space-y-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Usuários e Perfis</h1>
                </div>
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2 text-muted-foreground">
                            <ShieldAlert className="h-6 w-6" /> Carregando...
                        </CardTitle>
                        <CardDescription>
                            Verificando suas permissões de acesso.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const getStatusBadgeVariant = (status: User['status']) => {
        switch (status) {
            case 'Ativo': return 'default';
            case 'Inativo': return 'destructive';
            case 'Pendente': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Link href="/cadastros">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Usuários e Perfis</h1>
                    <p className="text-muted-foreground">Gerencie os usuários do sistema, seus perfis de acesso e permissões.</p>
                </div>
            </div>

            {activeProfile.isAdmin || activeProfile.isMaster ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Usuários</CardTitle>
                                <CardDescription>{users.length} usuários encontrados.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar por nome ou e-mail..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                    <DialogTrigger asChild>
                                        <Button onClick={handleNewUserClick}><Plus className="mr-2 h-4 w-4" /> Convidar Usuário</Button>
                                    </DialogTrigger>
                                    <ItemForm 
                                        onSave={handleSave} 
                                        onOpenChange={setIsDialogOpen}
                                        item={editingItem}
                                        users={users}
                                        activeProfile={activeProfile}
                                    />
                                </Dialog>
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
                                        <TableHead>Permissões</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[64px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length > 0 ? filteredItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.email}</TableCell>
                                            <TableCell>
                                            {renderPermissions(item)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditClick(item)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />Remover Acesso
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">Nenhum usuário encontrado.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <MyProfileCard profile={activeProfile} onSave={handleMyProfileSave} />
            )}

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>Essa ação não pode ser desfeita e removerá o acesso do usuário à empresa.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// FORMULÁRIO DO ADMINISTRADOR
interface ItemFormProps {
    onSave: (item: Omit<User, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: User | null;
    users: User[];
    activeProfile: User;
}

const initialPermissions = modules.reduce((acc, module) => {
    acc[module.id] = false;
    return acc;
}, {} as UserPermissions);

const initialFormState: Omit<User, 'id'> = {
    name: '',
    email: '',
    password: '',
    isAdmin: false,
    isMaster: false,
    permissions: initialPermissions,
    allowedCompanyIds: [],
    status: 'Ativo',
    planoId: 'Gratuito',
    statusLicenca: 'Ativa'
};

function ItemForm({ onSave, onOpenChange, item, users, activeProfile }: ItemFormProps) {
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
                name: item.name || '',
                email: item.email || '',
                password: '',
                isAdmin: item.isAdmin || false,
                isMaster: item.isMaster || false,
                permissions: item.permissions || initialPermissions,
                allowedCompanyIds: item.allowedCompanyIds || [],
                status: item.status || 'Ativo',
                planoId: item.planoId || 'Gratuito',
                statusLicenca: item.statusLicenca || 'Ativa'
            });
        } else {
            setFormData(initialFormState);
        }
    }, [item]);
    
    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePermissionChange = (moduleId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [moduleId]: checked }
        }));
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
        if (!item && !formData.password) {
             toast({
                variant: 'destructive',
                title: 'Campo Obrigatório',
                description: 'A senha é obrigatória para novos usuários.'
            });
            return;
        }
        onSave(formData);
    };
    
    const isEditingSelf = item?.id === activeProfile.id;

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Convidar'} Usuário</DialogTitle>
                <DialogDescription>Preencha os dados e defina o perfil de acesso do usuário.</DialogDescription>
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
                    <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder={item ? "Deixe em branco para não alterar" : "Senha de acesso"} required={!item}/>
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
                            <Label htmlFor="isAdmin" className='flex items-center'><ShieldCheck className='mr-2 h-4 w-4 text-primary' />Perfil de Administrador</Label>
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
                        disabled={isEditingSelf && (formData.isAdmin || formData.isMaster)}
                    />
                </div>
                 <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-medium text-sm">Permissões de Módulo</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {modules.map(module => (
                            <div key={module.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`perm-${module.id}`}
                                    checked={formData.isAdmin || formData.isMaster || (formData.permissions ? formData.permissions[module.id] : false)}
                                    onCheckedChange={(checked) => handlePermissionChange(module.id, !!checked)}
                                    disabled={formData.isAdmin || formData.isMaster}
                                />
                                <Label htmlFor={`perm-${module.id}`} className="font-normal text-sm">{module.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

// CARD DO USUÁRIO SECUNDÁRIO
interface MyProfileCardProps {
    profile: User;
    onSave: (newPassword: string) => void;
}

function MyProfileCard({ profile, onSave }: MyProfileCardProps) {
    const { toast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast({ variant: 'destructive', title: 'Campos vazios', description: 'Por favor, preencha a nova senha e a confirmação.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Senhas não coincidem', description: 'A nova senha e a confirmação devem ser iguais.' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Senha muito curta', description: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }
        onSave(newPassword);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><UserIcon className='h-6 w-6' /> Meu Perfil</CardTitle>
                <CardDescription>Visualize seus dados e altere sua senha de acesso.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={profile.name} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profile.email} disabled />
                        </div>
                    </div>
                    <Separator />
                    <h3 className="font-medium text-primary pt-2">Alterar Senha</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder='••••••'/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder='••••••'/>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Nova Senha
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

    