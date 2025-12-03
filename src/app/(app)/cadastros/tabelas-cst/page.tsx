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
import { Textarea } from '@/components/ui/textarea';

interface TaxCode {
    id: number;
    code: string;
    description: string;
    type: 'CST-ICMS' | 'CSOSN' | 'CST-IPI' | 'CST-PIS' | 'CST-COFINS';
}

export default function TabelasCstPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [items, setItems] = useScopedData<TaxCode[]>('cadastros-tabelas-cst', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<TaxCode | null>(null);
    const [editingItem, setEditingItem] = useState<TaxCode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<TaxCode, 'id'>) => {
        if (editingItem) {
            setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Código Atualizado!" });
        } else {
            const newItem: TaxCode = { ...itemData, id: Date.now() };
            setItems(prev => [...prev, newItem]);
            toast({ title: "Código Adicionado!" });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: TaxCode) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Item Excluído!" });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: TaxCode) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => {
            if (a.type === b.type) {
                return a.code.localeCompare(b.code);
            }
            return a.type.localeCompare(b.type);
        });
    }, [items, searchTerm]);

    const getBadgeVariant = (type: TaxCode['type']) => {
        switch(type) {
            case 'CST-ICMS': return 'default';
            case 'CSOSN': return 'secondary';
            case 'CST-IPI': return 'outline';
            case 'CST-PIS': return 'default';
            case 'CST-COFINS': return 'secondary';
            default: return 'outline';
        }
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Tabelas CST/CSOSN</h1>
                    <p className="text-muted-foreground">
                        Gerencie os Códigos de Situação Tributária (CST) e Códigos de Situação da Operação no Simples Nacional (CSOSN).
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Códigos Cadastrados</CardTitle>
                            <CardDescription>{items.length} códigos encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por código ou descrição..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Novo Código</Button>
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
                                    <TableHead className="w-[150px]">Código</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-[150px]">Tipo</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium font-mono">{item.code}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell><Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge></TableCell>
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
                                        <TableCell colSpan={4} className="h-24 text-center">Nenhum item encontrado.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente o código.</AlertDialogDescription>
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
    onSave: (item: Omit<TaxCode, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: TaxCode | null;
}

function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TaxCode['type'] | undefined>(undefined);

    useEffect(() => {
        if (item) {
            setCode(item.code);
            setDescription(item.description);
            setType(item.type);
        } else {
            setCode('');
            setDescription('');
            setType(undefined);
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !description || !type) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha todos os campos.'
            });
            return;
        }
        onSave({ code, description, type });
    };
    
    return (
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} Código Tributário</DialogTitle>
                <DialogDescription>Preencha os dados do código CST, CSOSN, etc.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Código *</Label>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Código *</Label>
                        <Select value={type} onValueChange={(v) => setType(v as any)} required>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CST-ICMS">CST-ICMS</SelectItem>
                                <SelectItem value="CSOSN">CSOSN</SelectItem>
                                <SelectItem value="CST-IPI">CST-IPI</SelectItem>
                                <SelectItem value="CST-PIS">CST-PIS</SelectItem>
                                <SelectItem value="CST-COFINS">CST-COFINS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Descrição completa do código tributário." />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}