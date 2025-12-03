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
import { Product } from '@/types/fiscal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MoneyInput } from '@/components/ui/money-input';

interface UnidadeDeMedida {
    id: number;
    sigla: string;
    descricao: string;
}

export default function ProdutosPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [products, setProducts] = useScopedData<Product[]>('cadastros-produtos', []);
    const [unidadesDeMedida] = useScopedData<UnidadeDeMedida[]>('cadastros-unidade-de-medida', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Product | null>(null);
    const [editingItem, setEditingItem] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<Product, 'id' | 'codigo'>) => {
        if (editingItem) {
            setProducts(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Produto Atualizado!", description: "O produto foi atualizado com sucesso." });
        } else {
            const newCode = (products.length + 1).toString();
            const newItem: Product = { ...itemData, id: Date.now(), codigo: newCode };
            setProducts(prev => [...prev, newItem]);
            toast({ title: "Produto Adicionado!", description: "O novo produto foi salvo no seu catálogo." });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: Product) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setProducts(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Produto Excluído!", description: `O produto foi removido.` });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: Product) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return products.filter(item =>
            item.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.descricao.localeCompare(b.descricao));
    }, [products, searchTerm]);

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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cadastro de Produtos</h1>
                    <p className="text-muted-foreground">Gerencie seu catálogo de produtos.</p>
                </div>
            </div>


            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Produtos Cadastrados</CardTitle>
                            <CardDescription>{products.length} produtos encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por código ou descrição..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Novo Produto</Button>
                                </DialogTrigger>
                                <ItemForm 
                                    onSave={handleSave} 
                                    onOpenChange={setIsDialogOpen}
                                    item={editingItem}
                                    unidadesDeMedida={unidadesDeMedida}
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
                                    <TableHead>NCM</TableHead>
                                    <TableHead>CFOP</TableHead>
                                    <TableHead className="w-[150px] text-right">Valor (R$)</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium font-mono">{item.codigo}</TableCell>
                                        <TableCell>{item.descricao}</TableCell>
                                        <TableCell className="font-mono">{item.ncm}</TableCell>
                                        <TableCell className="font-mono">{item.cfop}</TableCell>
                                        <TableCell className="text-right font-mono">{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
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
                                        <TableCell colSpan={6} className="h-24 text-center">Nenhum produto encontrado.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente o produto.</AlertDialogDescription>
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
    onSave: (item: Omit<Product, 'id' | 'codigo'>) => void;
    onOpenChange: (open: boolean) => void;
    item: Product | null;
    unidadesDeMedida: UnidadeDeMedida[];
}

const initialFormState: Omit<Product, 'id' | 'tipo' | 'codigo'> = {
    descricao: '',
    valor: 0,
    unidadeMedida: 'UN',
    ncm: '',
    cest: '',
    cfop: '',
    origem: '0',
    icms: { cst: '', aliquota: 0, baseCalculo: 0 },
    ipi: { cst: '', aliquota: 0 },
    pis: { cst: '', aliquota: 0 },
    cofins: { cst: '', aliquota: 0 },
};

function ItemForm({ onSave, onOpenChange, item, unidadesDeMedida }: ItemFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'tipo' | 'codigo'>>(initialFormState);
    
    useEffect(() => {
        if (item) {
            setFormData({
                descricao: item.descricao ?? '',
                valor: item.valor ?? 0,
                unidadeMedida: item.unidadeMedida ?? 'UN',
                ncm: item.ncm ?? '',
                cest: item.cest ?? '',
                cfop: item.cfop ?? '',
                origem: item.origem ?? '0',
                icms: item.icms ?? { cst: '', aliquota: 0, baseCalculo: 0 },
                ipi: item.ipi ?? { cst: '', aliquota: 0 },
                pis: item.pis ?? { cst: '', aliquota: 0 },
                cofins: item.cofins ?? { cst: '', aliquota: 0 },
            });
        } else {
            setFormData(initialFormState);
        }
    }, [item]);

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTaxChange = (tax: 'icms' | 'ipi' | 'pis' | 'cofins', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [tax]: {
                ...prev[tax],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.descricao || formData.valor <= 0) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Descrição e Valor (maior que zero) são obrigatórios.'
            });
            return;
        }
        onSave({ ...formData, tipo: 'Produto' });
    };
    
    return (
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} Produto</DialogTitle>
                <DialogDescription>Preencha os dados fiscais e tributários do produto.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6 py-4">
                    {/* Dados Gerais */}
                    <Card>
                        <CardHeader><CardTitle>Dados Gerais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Input id="descricao" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="codigo">Código do Produto</Label>
                                    <Input id="codigo" value={item?.codigo || "Automático"} disabled />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="valor">Valor Unitário</Label>
                                    <MoneyInput
                                        id="valor"
                                        value={formData.valor}
                                        onValueChange={(value) => handleInputChange('valor', value)}
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                                    <Select value={formData.unidadeMedida} onValueChange={(v) => handleInputChange('unidadeMedida', v)} required>
                                        <SelectTrigger id="unidadeMedida">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidadesDeMedida.map(un => (
                                                <SelectItem key={un.id} value={un.sigla}>{un.sigla} - {un.descricao}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     {/* Dados Fiscais */}
                    <Card>
                        <CardHeader><CardTitle>Dados Fiscais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="ncm">NCM</Label>
                                    <Input id="ncm" value={formData.ncm} onChange={(e) => handleInputChange('ncm', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cest">CEST</Label>
                                    <Input id="cest" value={formData.cest} onChange={(e) => handleInputChange('cest', e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="cfop">CFOP Padrão</Label>
                                    <Input id="cfop" value={formData.cfop} onChange={(e) => handleInputChange('cfop', e.target.value)} />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="origem">Origem da Mercadoria</Label>
                                    <Select value={formData.origem} onValueChange={(v) => handleInputChange('origem', v)}>
                                        <SelectTrigger id="origem"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0 - Nacional</SelectItem>
                                            <SelectItem value="1">1 - Estrangeira (Importação direta)</SelectItem>
                                            <SelectItem value="2">2 - Estrangeira (Adquirida no mercado interno)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                             </div>
                        </CardContent>
                    </Card>

                    {/* Tributos */}
                    <Card>
                        <CardHeader><CardTitle>Tributos</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {/* ICMS */}
                            <h4 className="font-semibold text-primary">ICMS</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label>CST</Label><Input value={formData.icms.cst} onChange={(e) => handleTaxChange('icms', 'cst', e.target.value)}/></div>
                                <div className="space-y-2"><Label>Alíquota (%)</Label><Input type="number" value={formData.icms.aliquota} onChange={(e) => handleTaxChange('icms', 'aliquota', parseFloat(e.target.value) || 0)}/></div>
                            </div>
                            <Separator />
                            {/* IPI */}
                            <h4 className="font-semibold text-primary">IPI</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label>CST</Label><Input value={formData.ipi.cst} onChange={(e) => handleTaxChange('ipi', 'cst', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Alíquota (%)</Label><Input type="number" value={formData.ipi.aliquota} onChange={(e) => handleTaxChange('ipi', 'aliquota', parseFloat(e.target.value) || 0)} /></div>
                            </div>
                             <Separator />
                            {/* PIS/COFINS */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
                                <div>
                                    <h4 className="font-semibold text-primary">PIS</h4>
                                    <div className="grid grid-cols-2 gap-4 items-end mt-2">
                                        <div className="space-y-2"><Label>CST</Label><Input value={formData.pis.cst} onChange={(e) => handleTaxChange('pis', 'cst', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Alíquota (%)</Label><Input type="number" value={formData.pis.aliquota} onChange={(e) => handleTaxChange('pis', 'aliquota', parseFloat(e.target.value) || 0)} /></div>
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-primary">COFINS</h4>
                                    <div className="grid grid-cols-2 gap-4 items-end mt-2">
                                        <div className="space-y-2"><Label>CST</Label><Input value={formData.cofins.cst} onChange={(e) => handleTaxChange('cofins', 'cst', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Alíquota (%)</Label><Input type="number" value={formData.cofins.aliquota} onChange={(e) => handleTaxChange('cofins', 'aliquota', parseFloat(e.target.value) || 0)} /></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
