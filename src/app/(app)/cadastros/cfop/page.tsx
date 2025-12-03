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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Cfop {
    id: number;
    code: string;
    description: string;
    application: string;
    type: 'Entrada' | 'Saída';
}

export default function CfopPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [cfops, setCfops] = useScopedData<Cfop[]>('cadastros-cfop', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Cfop | null>(null);
    const [editingItem, setEditingItem] = useState<Cfop | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<Cfop, 'id'>) => {
        if (editingItem) {
            setCfops(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "CFOP Atualizado!", description: "O código CFOP foi atualizado." });
        } else {
            const newItem: Cfop = { ...itemData, id: Date.now() };
            setCfops(prev => [...prev, newItem]);
            toast({ title: "CFOP Adicionado!", description: "O novo código CFOP foi salvo." });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: Cfop) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setCfops(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "CFOP Excluído!", description: `O CFOP foi removido.` });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: Cfop) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return cfops.filter(item =>
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.code.localeCompare(b.code));
    }, [cfops, searchTerm]);

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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cadastro de CFOP</h1>
                    <p className="text-muted-foreground">Gerencie os Códigos Fiscais de Operações e Prestações.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>CFOPs Cadastrados</CardTitle>
                            <CardDescription>{cfops.length} códigos encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por código ou descrição..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Novo CFOP</Button>
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
                                    <TableHead className="w-[120px]">Código</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Aplicação</TableHead>
                                    <TableHead className="w-[100px]">Tipo</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium font-mono">{item.code}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className='text-muted-foreground text-xs'>{item.application}</TableCell>
                                        <TableCell>{item.type}</TableCell>
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
                                                        <Trash2 className="mr-2 h-4 w-4" />Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">Nenhum CFOP encontrado.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente o CFOP.</AlertDialogDescription>
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
    onSave: (item: Omit<Cfop, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: Cfop | null;
}

function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [application, setApplication] = useState('');
    const [type, setType] = useState<'Entrada' | 'Saída' | undefined>(undefined);

    useEffect(() => {
        if (item) {
            setCode(item.code);
            setDescription(item.description);
            setApplication(item.application);
            setType(item.type);
        } else {
            setCode('');
            setDescription('');
            setApplication('');
            setType(undefined);
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !description || !type || !application) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha todos os campos.'
            });
            return;
        }
        onSave({ code, description, application, type });
    };
    
    return (
        <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} CFOP</DialogTitle>
                <DialogDescription>Preencha os dados detalhados do código fiscal.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Código *</Label>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo *</Label>
                        <Select value={type} onValueChange={(v) => setType(v as any)} required>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Entrada">Entrada</SelectItem>
                                <SelectItem value="Saída">Saída</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="application">Aplicação *</Label>
                    <Textarea id="application" value={application} onChange={(e) => setApplication(e.target.value)} required placeholder="Ex: Venda de mercadoria adquirida ou recebida de terceiros." />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}