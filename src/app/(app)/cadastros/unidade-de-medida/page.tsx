'use client';
import { useState, useMemo } from 'react';
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

interface UnidadeDeMedida {
    id: number;
    sigla: string;
    descricao: string;
}

export default function UnidadeDeMedidaPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [items, setItems] = useScopedData<UnidadeDeMedida[]>('cadastros-unidade-de-medida', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<UnidadeDeMedida | null>(null);
    const [editingItem, setEditingItem] = useState<UnidadeDeMedida | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<UnidadeDeMedida, 'id'>) => {
        if (editingItem) {
            setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Unidade de Medida Atualizada!" });
        } else {
            const newItem: UnidadeDeMedida = { ...itemData, id: Date.now() };
            setItems(prev => [...prev, newItem]);
            toast({ title: "Unidade de Medida Adicionada!" });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: UnidadeDeMedida) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Item Excluído!" });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: UnidadeDeMedida) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.sigla.localeCompare(b.sigla));
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Unidades de Medida</h1>
                    <p className="text-muted-foreground">Gerencie as unidades de medida utilizadas nos produtos.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Unidades Cadastradas</CardTitle>
                            <CardDescription>{items.length} unidades encontradas.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por sigla ou descrição..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Nova Unidade</Button>
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
                                    <TableHead className="w-[150px]">Sigla</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium font-mono">{item.sigla}</TableCell>
                                        <TableCell>{item.descricao}</TableCell>
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
                                        <TableCell colSpan={3} className="h-24 text-center">Nenhum item encontrado.</TableCell>
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
    onSave: (item: Omit<UnidadeDeMedida, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: UnidadeDeMedida | null;
}

function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [sigla, setSigla] = useState(item?.sigla || '');
    const [descricao, setDescricao] = useState(item?.descricao || '');

    useState(() => {
        if (item) {
            setSigla(item.sigla);
            setDescricao(item.descricao);
        } else {
            setSigla('');
            setDescricao('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sigla || !descricao) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha a sigla e a descrição.'
            });
            return;
        }
        onSave({ sigla: sigla.toUpperCase(), descricao });
    };
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Nova'} Unidade de Medida</DialogTitle>
                <DialogDescription>Preencha os dados.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="sigla">Sigla</Label>
                    <Input id="sigla" value={sigla} onChange={(e) => setSigla(e.target.value)} required placeholder="Ex: UN, KG, CX" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required placeholder="Ex: Unidade, Quilograma, Caixa" />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
