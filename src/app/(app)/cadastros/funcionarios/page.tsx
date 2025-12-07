
'use client';
import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, ArrowLeft, Loader2 } from 'lucide-react';
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
import type { Funcionario } from '@/types/pessoal';
import { format } from 'date-fns';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';


export default function FuncionariosPage() {
    const { toast } = useToast();
    const { currentCompany } = useCompany();
    const firestore = useFirestore();

    const funcionariosQuery = useMemoFirebase(() => {
        if (!currentCompany) return null;
        return query(collection(firestore, "empresas", String(currentCompany), "funcionarios"));
    }, [firestore, currentCompany]);

    const { data: funcionarios, isLoading: isLoadingFuncionarios } = useCollection<Funcionario>(funcionariosQuery as any);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Funcionario | null>(null);
    const [editingItem, setEditingItem] = useState<Funcionario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = async (itemData: Omit<Funcionario, 'id'>) => {
        if (!currentCompany) return;
        try {
            if (editingItem) {
                const funcDoc = doc(firestore, "empresas", String(currentCompany), "funcionarios", editingItem.id);
                await updateDoc(funcDoc, itemData);
                toast({ title: "Funcionário Atualizado!", description: "Os dados do funcionário foram atualizados." });
            } else {
                const funcsCollection = collection(firestore, "empresas", String(currentCompany), "funcionarios");
                await addDoc(funcsCollection, itemData);
                toast({ title: "Funcionário Adicionado!", description: "O novo funcionário foi salvo." });
            }
        } catch (error: any) {
             toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message });
        }
        
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: Funcionario) => setItemToDelete(item);

    const handleConfirmDelete = async () => {
        if (itemToDelete && currentCompany) {
            try {
                const funcDoc = doc(firestore, "empresas", String(currentCompany), "funcionarios", itemToDelete.id);
                await deleteDoc(funcDoc);
                toast({ variant: "destructive", title: "Funcionário Excluído!", description: `O funcionário foi removido.` });
            } catch (error: any) {
                toast({ variant: "destructive", title: "Erro ao Excluir", description: error.message });
            }
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: Funcionario) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        if (!funcionarios) return [];
        return funcionarios.filter(item =>
            item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.cpf.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.nome.localeCompare(b.nome));
    }, [funcionarios, searchTerm]);

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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cadastro de Funcionários</h1>
                    <p className="text-muted-foreground">Gerencie os dados dos colaboradores da sua empresa.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Funcionários Cadastrados</CardTitle>
                            <CardDescription>{funcionarios?.length || 0} funcionários encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nome ou CPF..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Novo Funcionário</Button>
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
                                    <TableHead>Data de Admissão</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {isLoadingFuncionarios ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nome}</TableCell>
                                        <TableCell className="font-mono">{item.cpf}</TableCell>
                                        <TableCell>{item.cargo}</TableCell>
                                        <TableCell>{format(new Date(item.dataAdmissao), 'dd/MM/yyyy')}</TableCell>
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
                                        <TableCell colSpan={5} className="h-24 text-center">Nenhum funcionário encontrado.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente o cadastro do funcionário.</AlertDialogDescription>
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
    onSave: (item: Omit<Funcionario, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    item: Funcionario | null;
}

const initialFormData: Omit<Funcionario, 'id'> = {
    nome: '',
    cpf: '',
    dataAdmissao: '',
    cargo: '',
    departamento: '',
    salario: 0,
    dataNascimento: '',
    genero: 'Outro',
    estadoCivil: 'Solteiro(a)',
    nacionalidade: 'Brasileiro(a)',
    rg: '',
    pis: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
    contato: { telefone: '', email: '' },
    contrato: { horarioTrabalho: '', tipoContrato: 'CLT' },
    dadosBancarios: { banco: '', agencia: '', conta: '' },
};


function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Omit<Funcionario, 'id'>>(initialFormData);

    useEffect(() => {
        if (item) {
            setFormData({
                ...initialFormData,
                ...item,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [item]);

    const handleInputChange = (field: keyof Funcionario, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleNestedChange = (section: 'endereco' | 'contato' | 'contrato' | 'dadosBancarios', field: string, value: any) => {
         setFormData(prev => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nome || !formData.cpf || !formData.dataAdmissao || !formData.cargo || formData.salario <= 0) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Nome, CPF, Data de Admissão, Cargo e Salário são obrigatórios.'
            });
            return;
        }
        onSave(formData);
    };
    
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} Funcionário</DialogTitle>
                <DialogDescription>Preencha os dados do colaborador.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Nome Completo *</Label><Input value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>CPF *</Label><Input value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Data de Admissão *</Label><Input type="date" value={formData.dataAdmissao.split('T')[0]} onChange={(e) => handleInputChange('dataAdmissao', e.target.value)} required /></div>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Cargo *</Label><Input value={formData.cargo} onChange={(e) => handleInputChange('cargo', e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Departamento</Label><Input value={formData.departamento} onChange={(e) => handleInputChange('departamento', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Salário *</Label><Input type="number" value={formData.salario} onChange={(e) => handleInputChange('salario', parseFloat(e.target.value) || 0)} required /></div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
