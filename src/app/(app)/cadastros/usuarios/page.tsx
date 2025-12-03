'use client';
import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, ArrowLeft } from 'lucide-react';
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

interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
}

export default function UsuariosPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [users, setUsers] = useScopedData<User[]>('cadastros-usuarios', []);
    const [, setAuditLogs] = useScopedData<AuditLog[]>('audit-trail-logs', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<User | null>(null);
    const [editingItem, setEditingItem] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<User, 'id'>) => {
        if (editingItem) {
            setUsers(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Usuário Atualizado!", description: "Os dados do usuário foram atualizados." });
            logAudit(setAuditLogs, 'UPDATE', 'Usuários', `Atualizou o usuário "${itemData.name}".`);
        } else {
            const newItem: User = { ...itemData, id: Date.now() };
            setUsers(prev => [...prev, newItem]);
            toast({ title: "Usuário Adicionado!", description: "Um novo usuário foi convidado para a empresa." });
             logAudit(setAuditLogs, 'CREATE', 'Usuários', `Convidou o usuário "${itemData.name}" (${itemData.email}).`);
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: User) => setItemToDelete(item);

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

    const filteredItems = useMemo(() => {
        return users.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [users, searchTerm]);

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
                                    <Button><Plus className="mr-2 h-4 w-4" /> Convidar Usuário</Button>
                                </DialogTrigger>
                                <ItemForm 
                                    onSave={handleSave} 
                                    onOpenChange={setIsDialogOpen}
                                    item={editingItem}
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
                                    <TableHead>Perfil</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.isAdmin ? 'default' : 'secondary'}>
                                                {item.isAdmin ? 'Administrador' : 'Usuário Padrão'}
                                            </Badge>
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
}

function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setEmail(item.email);
            setIsAdmin(item.isAdmin);
        } else {
            setName('');
            setEmail('');
            setIsAdmin(false);
        }
    }, [item]);

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
        onSave({ name, email, isAdmin });
    };
    
    return (
        <DialogContent className="sm:max-w-md">
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
                 <div className="space-y-2 flex items-center justify-between rounded-lg border p-3">
                    <div className='space-y-0.5'>
                        <Label htmlFor="isAdmin">Perfil de Administrador</Label>
                        <p className='text-xs text-muted-foreground'>
                            Concede acesso total a todos os módulos e configurações.
                        </p>
                    </div>
                    <Switch
                        id="isAdmin"
                        checked={isAdmin}
                        onCheckedChange={setIsAdmin}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
