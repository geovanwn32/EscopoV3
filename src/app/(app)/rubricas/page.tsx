
'use client';
import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, ArrowLeft, FileDown, FileText, Sheet } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface Incidencias {
    inss: boolean;
    irrf: boolean;
    fgts: boolean;
    contribuicaoSindical: boolean;
}

interface Rubrica {
    id: number;
    codigo: string;
    descricao: string;
    tipo: 'Provento' | 'Desconto' | 'Informativa';
    incidencias: Incidencias;
}

export default function RubricasPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [items, setItems] = useScopedData<Rubrica[]>('cadastros-rubricas', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Rubrica | null>(null);
    const [editingItem, setEditingItem] = useState<Rubrica | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<Rubrica, 'id'>) => {
        if (editingItem) {
            setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Rubrica Atualizada!" });
        } else {
            const newItem: Rubrica = { ...itemData, id: Date.now() };
            setItems(prev => [...prev, newItem]);
            toast({ title: "Rubrica Adicionada!" });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: Rubrica) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Rubrica Excluída!" });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: Rubrica) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.codigo.localeCompare(b.codigo));
    }, [items, searchTerm]);

    const getBadgeVariant = (type: Rubrica['tipo']) => {
        switch(type) {
            case 'Provento': return 'default';
            case 'Desconto': return 'destructive';
            case 'Informativa': return 'secondary';
            default: return 'outline';
        }
    }
    
    const handleExportPdf = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        doc.text("Relatório de Rubricas", 14, 16);
        
        const tableColumn = ["Código", "Descrição", "Tipo", "Incidências"];
        const tableRows: any[] = [];

        filteredItems.forEach(item => {
            const incidencias = Object.entries(item.incidencias)
                .filter(([, value]) => value)
                .map(([key]) => {
                    if (key === 'inss') return 'INSS';
                    if (key === 'irrf') return 'IRRF';
                    if (key === 'fgts') return 'FGTS';
                    if (key === 'contribuicaoSindical') return 'Sindical';
                    return '';
                }).join(', ');

            const row = [
                item.codigo,
                item.descricao,
                item.tipo,
                incidencias,
            ];
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        
        doc.save('relatorio_rubricas.pdf');
        toast({ title: "PDF Gerado!", description: "O relatório de rubricas foi baixado." });
    };

    const handleExportExcel = async () => {
        const XLSX = await import('xlsx');
        const worksheetData = filteredItems.map(item => ({
            'Código': item.codigo,
            'Descrição': item.descricao,
            'Tipo': item.tipo,
            'INSS': item.incidencias.inss ? 'Sim' : 'Não',
            'IRRF': item.incidencias.irrf ? 'Sim' : 'Não',
            'FGTS': item.incidencias.fgts ? 'Sim' : 'Não',
            'Contrib. Sindical': item.incidencias.contribuicaoSindical ? 'Sim' : 'Não',
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rubricas");
        XLSX.writeFile(workbook, "relatorio_rubricas.xlsx");
        toast({ title: "Excel Gerado!", description: "O relatório de rubricas foi baixado." });
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Rubricas</h1>
                    <p className="text-muted-foreground">Gerencie as rubricas para os cálculos de folha, férias, 13º e rescisão.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Rubricas Cadastradas</CardTitle>
                            <CardDescription>{items.length} rubricas encontradas.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por código ou descrição..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Exportar</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={handleExportPdf}><FileText className="mr-2 h-4 w-4" />Exportar para PDF</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleExportExcel}><Sheet className="mr-2 h-4 w-4" />Exportar para Excel</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Nova Rubrica</Button>
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
                                    <TableHead className="w-[120px]">Tipo</TableHead>
                                    <TableHead>Incidências</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium font-mono">{item.codigo}</TableCell>
                                        <TableCell>{item.descricao}</TableCell>
                                        <TableCell><Badge variant={getBadgeVariant(item.tipo)}>{item.tipo}</Badge></TableCell>
                                        <TableCell>
                                            <div className='flex flex-wrap gap-1'>
                                                {item.incidencias.inss && <Badge variant="outline">INSS</Badge>}
                                                {item.incidencias.irrf && <Badge variant="outline">IRRF</Badge>}
                                                {item.incidencias.fgts && <Badge variant="outline">FGTS</Badge>}
                                                {item.incidencias.contribuicaoSindical && <Badge variant="outline">Sindical</Badge>}
                                            </div>
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
                                                        <Trash2 className="mr-2 h-4 w-4" />Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">Nenhuma rubrica encontrada.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente a rubrica.</AlertDialogDescription>
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
    onSave: (item: Omit<Rubrica, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: Rubrica | null;
}

function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Omit<Rubrica, 'id'>>({
        codigo: '',
        descricao: '',
        tipo: 'Provento',
        incidencias: { inss: false, irrf: false, fgts: false, contribuicaoSindical: false }
    });

    useEffect(() => {
        if (item) {
            setFormData({
                codigo: item.codigo,
                descricao: item.descricao,
                tipo: item.tipo,
                incidencias: item.incidencias
            });
        } else {
            setFormData({
                codigo: '',
                descricao: '',
                tipo: 'Provento',
                incidencias: { inss: false, irrf: false, fgts: false, contribuicaoSindical: false }
            });
        }
    }, [item]);

    const handleIncidenciaChange = (field: keyof Incidencias, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            incidencias: {
                ...prev.incidencias,
                [field]: checked
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.codigo || !formData.descricao) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Código e Descrição são obrigatórios.'
            });
            return;
        }
        onSave(formData);
    };
    
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Nova'} Rubrica</DialogTitle>
                <DialogDescription>Preencha os dados e incidências da rubrica para eSocial e cálculos internos.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary">1. Identificação da Rubrica</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código (eSocial) *</Label>
                            <Input id="codigo" value={formData.codigo} onChange={(e) => setFormData(p => ({ ...p, codigo: e.target.value }))} required placeholder="Ex: 1000"/>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="descricao">Descrição *</Label>
                            <Input id="descricao" value={formData.descricao} onChange={(e) => setFormData(p => ({ ...p, descricao: e.target.value }))} required placeholder="Ex: Salário Base Mensal"/>
                        </div>
                    </div>
                </div>

                <Separator />

                 <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary">2. Natureza e Tipo</h3>
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo da Rubrica</Label>
                        <Select value={formData.tipo} onValueChange={(v) => setFormData(p => ({ ...p, tipo: v as any }))}>
                            <SelectTrigger id="tipo">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Provento">Provento</SelectItem>
                                <SelectItem value="Desconto">Desconto</SelectItem>
                                <SelectItem value="Informativa">Base de Cálculo / Informativa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary">3. Incidências Tributárias</h3>
                    <p className="text-sm text-muted-foreground">Marque sobre quais bases esta rubrica deve incidir para o cálculo de tributos.</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border p-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="inc-inss" checked={formData.incidencias.inss} onCheckedChange={(c) => handleIncidenciaChange('inss', !!c)} />
                            <Label htmlFor="inc-inss" className="font-normal">INSS</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="inc-irrf" checked={formData.incidencias.irrf} onCheckedChange={(c) => handleIncidenciaChange('irrf', !!c)} />
                            <Label htmlFor="inc-irrf" className="font-normal">IRRF</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="inc-fgts" checked={formData.incidencias.fgts} onCheckedChange={(c) => handleIncidenciaChange('fgts', !!c)} />
                            <Label htmlFor="inc-fgts" className="font-normal">FGTS</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="inc-sindical" checked={formData.incidencias.contribuicaoSindical} onCheckedChange={(c) => handleIncidenciaChange('contribuicaoSindical', !!c)} />
                            <Label htmlFor="inc-sindical" className="font-normal">Contrib. Sindical</Label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
