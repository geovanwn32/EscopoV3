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
import { Badge } from '@/components/ui/badge';

interface TipoNegociacao {
    id: number;
    name: string;
    description: string;
    type: 'À Vista' | 'A Prazo';
    installments: number;
    interval: number;
}

export default function TipoNegociacaoPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [items, setItems] = useScopedData<TipoNegociacao[]>('cadastros-tipo-negociacao', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<TipoNegociacao | null>(null);
    const [editingItem, setEditingItem] = useState<TipoNegociacao | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<TipoNegociacao, 'id'>) => {
        if (editingItem) {
            setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Tipo de Negociação Atualizado!" });
        } else {
            const newItem: TipoNegociacao = { ...itemData, id: Date.now() };
            setItems(prev => [...prev, newItem]);
            toast({ title: "Tipo de Negociação Adicionado!" });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: TipoNegociacao) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Item Excluído!" });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: TipoNegociacao) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [items, searchTerm]);

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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Tipos de Negociação</h1>
                    <p className="text-muted-foreground">Gerencie as condições e tipos de negociação comercial.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tipos Cadastrados</CardTitle>
                            <CardDescription>{items.length} tipos encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nome ou descrição..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Novo Tipo</Button>
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
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Parcelas</TableHead>
                                    <TableHead>Intervalo (dias)</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell><Badge variant={item.type === 'À Vista' ? 'default' : 'secondary'}>{item.type}</Badge></TableCell>
                                        <TableCell className="text-center">{item.installments}</TableCell>
                                        <TableCell className="text-center">{item.interval}</TableCell>
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
                                        <TableCell colSpan={6} className="h-24 text-center">Nenhum item encontrado.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente o item.</AlertDialogDescription>
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
    onSave: (item: Omit<TipoNegociacao, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: TipoNegociacao | null;
}

function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'À Vista' | 'A Prazo' | undefined>(undefined);
    const [installments, setInstallments] = useState(1);
    const [interval, setInterval] = useState(0);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setDescription(item.description);
            setType(item.type);
            setInstallments(item.installments);
            setInterval(item.interval);
        } else {
            setName('');
            setDescription('');
            setType(undefined);
            setInstallments(1);
            setInterval(0);
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !type) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha o nome e o tipo.'
            });
            return;
        }
        onSave({ name, description, type, installments, interval });
    };
    
    return (
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} Tipo de Negociação</DialogTitle>
                <DialogDescription>Preencha os dados e condições de pagamento.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Condição *</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: 30 dias" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Pagamento *</Label>
                        <Select value={type} onValueChange={(v) => setType(v as any)} required>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="À Vista">À Vista</SelectItem>
                                <SelectItem value="A Prazo">A Prazo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Pagamento em 30 dias corridos" />
                </div>
                {type === 'A Prazo' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="installments">Nº de Parcelas</Label>
                            <Input id="installments" type="number" value={installments} onChange={(e) => setInstallments(Math.max(1, parseInt(e.target.value) || 1))} min={1}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="interval">Intervalo entre Parcelas (dias)</Label>
                            <Input id="interval" type="number" value={interval} onChange={(e) => setInterval(Math.max(0, parseInt(e.target.value) || 0))} min={0}/>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
