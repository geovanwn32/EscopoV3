
'use client';
import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, ArrowLeft, CalendarIcon } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoneyInput } from '@/components/ui/money-input';

interface Socio {
    id: number;
    // Dados Pessoais
    nome: string;
    cpf: string;
    dataNascimento?: string;
    nacionalidade?: string;
    estadoCivil?: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável';
    profissao?: string;
    rg?: { numero: string; orgaoEmissor: string; uf: string; };
    pis?: string;
    endereco?: { rua: string; numero: string; bairro: string; cidade: string; cep: string; estado: string; complemento?: string; };
    telefone?: string;
    email?: string;
    // Dados Societários
    tipoSocio?: 'Pessoa Física' | 'Pessoa Jurídica';
    cargo: string;
    dataEntrada: string; // ISO string
    participacao: number;
    responsabilidadeAdmin?: string;
    // Remuneração
    dadosRemuneracao?: {
        tipo: 'Pró-labore' | 'Distribuição de Lucros' | 'RCI';
        proLaboreValor?: number;
    };
    // Dados Bancários
    dadosBancarios?: {
        banco: string;
        agencia: string;
        conta: string;
        tipoConta: 'Corrente' | 'Poupança';
    };
}


export default function SociosPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [socios, setSocios] = useScopedData<Socio[]>('cadastros-socios', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Socio | null>(null);
    const [editingItem, setEditingItem] = useState<Socio | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<Socio, 'id'>) => {
        if (editingItem) {
            setSocios(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Sócio Atualizado!", description: "Os dados do sócio foram atualizados." });
        } else {
            const newItem: Socio = { ...itemData, id: Date.now() };
            setSocios(prev => [...prev, newItem]);
            toast({ title: "Sócio Adicionado!", description: "O novo sócio foi cadastrado." });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: Socio) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setSocios(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Sócio Excluído!", description: `O sócio foi removido.` });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: Socio) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return socios.filter(item =>
            item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.cpf.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.nome.localeCompare(b.nome));
    }, [socios, searchTerm]);

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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cadastro de Sócios</h1>
                    <p className="text-muted-foreground">Gerencie os dados dos sócios da empresa.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Sócios Cadastrados</CardTitle>
                            <CardDescription>{socios.length} sócios encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nome ou CPF..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Novo Sócio</Button>
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
                                    <TableHead>CPF</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead className="text-center">Participação (%)</TableHead>
                                    <TableHead>Data de Entrada</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nome}</TableCell>
                                        <TableCell className="font-mono">{item.cpf}</TableCell>
                                        <TableCell>{item.cargo}</TableCell>
                                        <TableCell className="text-center font-mono">{item.participacao}%</TableCell>
                                        <TableCell>{format(new Date(item.dataEntrada), 'dd/MM/yyyy')}</TableCell>
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
                                        <TableCell colSpan={6} className="h-24 text-center">Nenhum sócio encontrado.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente o cadastro do sócio.</AlertDialogDescription>
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
    onSave: (item: Omit<Socio, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: Socio | null;
}

const initialFormData: Omit<Socio, 'id'> = {
    nome: '',
    cpf: '',
    dataNascimento: '',
    nacionalidade: 'Brasileiro(a)',
    estadoCivil: 'Solteiro(a)',
    profissao: '',
    rg: { numero: '', orgaoEmissor: '', uf: '' },
    pis: '',
    endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '', estado: '' },
    telefone: '',
    email: '',
    tipoSocio: 'Pessoa Física',
    cargo: 'Sócio-Administrador',
    dataEntrada: '',
    participacao: 0,
    responsabilidadeAdmin: '',
    dadosRemuneracao: { tipo: 'Pró-labore', proLaboreValor: 0 },
    dadosBancarios: { banco: '', agencia: '', conta: '', tipoConta: 'Corrente' },
};


function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Omit<Socio, 'id'>>(initialFormData);

    useEffect(() => {
        if (item) {
            setFormData({
               ...initialFormData, // Start with defaults to avoid undefined errors
               ...item,
               // Ensure nested objects are not undefined
               rg: item.rg || initialFormData.rg,
               endereco: item.endereco || initialFormData.endereco,
               dadosRemuneracao: item.dadosRemuneracao || initialFormData.dadosRemuneracao,
               dadosBancarios: item.dadosBancarios || initialFormData.dadosBancarios
            });
        } else {
            setFormData(initialFormData);
        }
    }, [item]);

    const handleInputChange = (field: keyof Omit<Socio, 'id'>, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleNestedChange = (section: 'rg' | 'endereco' | 'dadosRemuneracao' | 'dadosBancarios', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [field]: value
            }
        }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nome || !formData.cpf || !formData.dataEntrada || formData.participacao <= 0) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Nome, CPF, Data de Entrada e Participação (maior que 0) são obrigatórios.'
            });
            return;
        }
        onSave(formData);
    };
    
    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} Sócio</DialogTitle>
                <DialogDescription>Preencha os dados do sócio.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <Tabs defaultValue="pessoal">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="societario">Dados Societários</TabsTrigger>
                        <TabsTrigger value="remuneracao">Remuneração/RCI</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pessoal" className="space-y-4 pt-4">
                        <div className="space-y-2"><Label>Nome Completo *</Label><Input value={formData.nome} onChange={e => handleInputChange('nome', e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>CPF *</Label><Input value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} required /></div><div className="space-y-2"><Label>Data de Nascimento</Label><Input type="date" value={formData.dataNascimento?.split('T')[0]} onChange={e => handleInputChange('dataNascimento', e.target.value)} /></div></div>
                        <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label>Nacionalidade</Label><Input value={formData.nacionalidade} onChange={e => handleInputChange('nacionalidade', e.target.value)} /></div><div className="space-y-2"><Label>Estado Civil</Label><Select value={formData.estadoCivil} onValueChange={(v) => handleInputChange('estadoCivil', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem><SelectItem value="Casado(a)">Casado(a)</SelectItem><SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem><SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem><SelectItem value="União Estável">União Estável</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Profissão</Label><Input value={formData.profissao} onChange={e => handleInputChange('profissao', e.target.value)} /></div></div>
                        <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label>RG</Label><Input placeholder="Número" value={formData.rg?.numero} onChange={e => handleNestedChange('rg', 'numero', e.target.value)} /></div><div className="space-y-2"><Label>Órgão Emissor</Label><Input placeholder="SSP" value={formData.rg?.orgaoEmissor} onChange={e => handleNestedChange('rg', 'orgaoEmissor', e.target.value)} /></div><div className="space-y-2"><Label>UF</Label><Input placeholder="GO" value={formData.rg?.uf} onChange={e => handleNestedChange('rg', 'uf', e.target.value)} /></div></div>
                        <div className="space-y-2"><Label>Endereço</Label><Input placeholder="Rua, Av..." value={formData.endereco?.rua} onChange={e => handleNestedChange('endereco', 'rua', e.target.value)} /></div>
                    </TabsContent>
                    <TabsContent value="societario" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Tipo de Sócio</Label><Select value={formData.tipoSocio} onValueChange={v => handleInputChange('tipoSocio', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Pessoa Física">Pessoa Física</SelectItem><SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Função / Cargo *</Label><Input value={formData.cargo} onChange={e => handleInputChange('cargo', e.target.value)} required/></div></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Data de Ingresso *</Label><Input type="date" value={formData.dataEntrada?.split('T')[0]} onChange={e => handleInputChange('dataEntrada', e.target.value)} required/></div><div className="space-y-2"><Label>Participação (%) *</Label><Input type="number" value={formData.participacao} onChange={e => handleInputChange('participacao', parseFloat(e.target.value) || 0)} required /></div></div>
                        <div className="space-y-2"><Label>Responsabilidade Administrativa</Label><Input placeholder="Ex: Assina pela empresa" value={formData.responsabilidadeAdmin} onChange={e => handleInputChange('responsabilidadeAdmin', e.target.value)} /></div>
                    </TabsContent>
                    <TabsContent value="remuneracao" className="space-y-4 pt-4">
                         <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Tipo de Remuneração</Label><Select value={formData.dadosRemuneracao?.tipo} onValueChange={v => handleNestedChange('dadosRemuneracao', 'tipo', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Pró-labore">Pró-labore</SelectItem><SelectItem value="Distribuição de Lucros">Distribuição de Lucros</SelectItem><SelectItem value="RCI">RCI</SelectItem></SelectContent></Select></div>{formData.dadosRemuneracao?.tipo === 'Pró-labore' && <div className="space-y-2"><Label>Valor Pró-labore (R$)</Label><MoneyInput id="pro-labore" value={formData.dadosRemuneracao.proLaboreValor || 0} onValueChange={v => handleNestedChange('dadosRemuneracao', 'proLaboreValor', v)} /></div>}</div>
                         <h4 className="font-semibold text-sm pt-4">Dados Bancários para Pagamento</h4>
                         <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label>Banco</Label><Input value={formData.dadosBancarios?.banco} onChange={e => handleNestedChange('dadosBancarios', 'banco', e.target.value)} /></div><div className="space-y-2"><Label>Agência</Label><Input value={formData.dadosBancarios?.agencia} onChange={e => handleNestedChange('dadosBancarios', 'agencia', e.target.value)} /></div><div className="space-y-2"><Label>Conta</Label><Input value={formData.dadosBancarios?.conta} onChange={e => handleNestedChange('dadosBancarios', 'conta', e.target.value)} /></div></div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
