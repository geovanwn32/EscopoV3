
'use client';
import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, ArrowLeft, ShieldCheck, ShieldAlert, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    permissions: UserPermissions;
    allowedCompanyIds: number[];
    password?: string;
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

    const loggedInUserIsAdmin = useMemo(() => {
        if (!firebaseUser || !users.length) return false;
        
        // On first run, there might not be a profile, but the first firebase user is the implicit admin
        if(users.length === 0) return true;

        const activeProfileId = sessionStorage.getItem(`user-profile-id`);
        if (activeProfileId) {
            const profile = users.find(u => u.id === Number(activeProfileId));
            return profile?.isAdmin ?? false;
        }
        return false;
    }, [firebaseUser, users]);

    const handleSave = (itemData: Omit<User, 'id'>) => {
        if (editingItem) {
            const updatedUser = { ...editingItem, ...itemData };
            // Do not update password if it's empty during an edit
            if (!itemData.password) {
                delete updatedUser.password;
            }
    
            setUsers(prev => {
                // If the updated user is now an admin, demote any other admin.
                if (updatedUser.isAdmin) {
                    return prev.map(user => 
                        user.id === editingItem.id 
                            ? updatedUser 
                            : { ...user, isAdmin: false }
                    );
                }
                // Otherwise, just update the user.
                return prev.map(user => 
                    user.id === editingItem.id ? updatedUser : user
                );
            });
    
            toast({ title: "Usuário Atualizado!", description: "Os dados do usuário foram atualizados." });
            logAudit(setAuditLogs, 'UPDATE', 'Usuários', `Atualizou o usuário "${itemData.name}".`);
        } else {
            const newItem: User = { ...itemData, id: Date.now() };
            
            setUsers(prev => {
                // If the new user is an admin, demote all other users.
                if (newItem.isAdmin) {
                    const demotedUsers = prev.map(user => ({ ...user, isAdmin: false }));
                    return [...demotedUsers, newItem];
                }
                return [...prev, newItem];
            });
    
            toast({ title: "Usuário Adicionado!", description: "Um novo usuário foi convidado para a empresa." });
            logAudit(setAuditLogs, 'CREATE', 'Usuários', `Convidou o usuário "${itemData.name}" (${itemData.email}).`);
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: User) => {
        if (item.isAdmin) {
            toast({
                variant: 'destructive',
                title: 'Ação não permitida',
                description: 'Não é possível excluir o perfil de administrador principal.',
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
        setEditingItem(null); // Explicitly set editingItem to null for new user
        setIsDialogOpen(true);
    }

    const filteredItems = useMemo(() => {
        return users.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [users, searchTerm]);

    const renderPermissions = (user: User) => {
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

            {!loggedInUserIsAdmin ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-6 w-6" /> Acesso Negado
                        </CardTitle>
                        <CardDescription>
                            Você não tem permissão para visualizar ou gerenciar os usuários deste sistema. Apenas administradores podem acessar esta seção.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Por favor, contate o administrador da sua empresa se você acredita que deveria ter acesso a esta funcionalidade.</p>
                    </CardContent>
                </Card>
            ) : (
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
                                        companies={companies}
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
                                            <TableCell colSpan={4} className="h-24 text-center">Nenhum usuário encontrado.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
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

interface ItemFormProps {
    onSave: (item: Omit<User, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: User | null;
    users: User[];
    companies: { id: number, name: string }[];
}

const initialPermissions = modules.reduce((acc, module) => {
    acc[module.id] = false;
    return acc;
}, {} as UserPermissions);


function ItemForm({ onSave, onOpenChange, item, users, companies }: ItemFormProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [permissions, setPermissions] = useState<UserPermissions>(initialPermissions);
    const [allowedCompanyIds, setAllowedCompanyIds] = useState<number[]>([]);


    const anotherAdminExists = useMemo(() => {
        // If creating a new user, check if any user is an admin.
        if (!item) {
            return users.some(user => user.isAdmin);
        }
        // If editing, check if another user (not the one being edited) is an admin.
        return users.some(user => user.isAdmin && user.id !== item.id);
    }, [users, item]);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setEmail(item.email);
            setPassword(''); // Do not show existing password
            setIsAdmin(item.isAdmin);
            setPermissions(item.permissions || initialPermissions);
            setAllowedCompanyIds(item.allowedCompanyIds || []);
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setIsAdmin(false);
            setPermissions(initialPermissions);
            setAllowedCompanyIds([]);
        }
    }, [item]);
    
    useEffect(() => {
    // If the user is an admin, they should have access to all companies.
    if (isAdmin) {
      setAllowedCompanyIds(companies.map(c => c.id));
    }
    }, [isAdmin, companies]);


    const handlePermissionChange = (moduleId: string, checked: boolean) => {
        setPermissions(prev => ({...prev, [moduleId]: checked}));
    }
    
    const handleCompanyAccessChange = (companyId: number, checked: boolean) => {
        if (isAdmin) return; // Admins always have access to all companies
        setAllowedCompanyIds(prev =>
            checked ? [...prev, companyId] : prev.filter(id => id !== companyId)
        );
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha o nome e o e-mail.'
            });
            return;
        }
        // Password is only required when creating a new user
        if (!item && !password) {
             toast({
                variant: 'destructive',
                title: 'Campo Obrigatório',
                description: 'A senha é obrigatória para novos usuários.'
            });
            return;
        }
        onSave({ name, email, password, isAdmin, permissions, allowedCompanyIds });
    };
    
    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Convidar'} Usuário</DialogTitle>
                <DialogDescription>Preencha os dados e defina o perfil de acesso do usuário.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">{item ? 'Nova Senha' : 'Senha'}</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={item ? "Deixe em branco para não alterar" : "Senha de acesso"} required={!item}/>
                </div>
                <Separator />
                 <div className="space-y-2 flex items-center justify-between rounded-lg border p-3">
                    <div className='space-y-0.5'>
                        <Label htmlFor="isAdmin" className='flex items-center'><ShieldCheck className='mr-2 h-4 w-4 text-primary' />Perfil de Administrador</Label>
                        <p className='text-xs text-muted-foreground'>
                            Concede acesso total a todos os módulos e empresas.
                        </p>
                    </div>
                    <Switch
                        id="isAdmin"
                        checked={isAdmin}
                        onCheckedChange={setIsAdmin}
                        disabled={!item?.isAdmin && anotherAdminExists}
                    />
                </div>
                 <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-medium text-sm">Permissões de Módulo</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {modules.map(module => (
                            <div key={module.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`perm-${module.id}`}
                                    checked={isAdmin || permissions[module.id]}
                                    onCheckedChange={(checked) => handlePermissionChange(module.id, !!checked)}
                                    disabled={isAdmin}
                                />
                                <Label htmlFor={`perm-${module.id}`} className="font-normal text-sm">{module.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-medium text-sm">Acesso às Empresas</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {companies.map(company => (
                            <div key={company.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`comp-${company.id}`}
                                    checked={isAdmin || allowedCompanyIds.includes(company.id)}
                                    onCheckedChange={(checked) => handleCompanyAccessChange(company.id, !!checked)}
                                    disabled={isAdmin}
                                />
                                <Label htmlFor={`comp-${company.id}`} className="font-normal text-sm flex items-center gap-2">
                                    <Building className='h-4 w-4 text-muted-foreground'/>
                                    {company.name}
                                </Label>
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
