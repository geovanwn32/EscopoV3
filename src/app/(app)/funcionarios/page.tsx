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
import { Funcionario } from '@/types/pessoal';
import { MoneyInput } from '@/components/ui/money-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';


export default function FuncionariosPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [funcionarios, setFuncionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Funcionario | null>(null);
    const [editingItem, setEditingItem] = useState<Funcionario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (itemData: Omit<Funcionario, 'id'>) => {
        if (editingItem) {
            setFuncionarios(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...itemData } : i));
            toast({ title: "Funcionário Atualizado!", description: "Os dados do funcionário foram atualizados." });
        } else {
            const newItem: Funcionario = { ...itemData, id: Date.now() };
            setFuncionarios(prev => [...prev, newItem]);
            toast({ title: "Funcionário Adicionado!", description: "O novo funcionário foi cadastrado." });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (item: Funcionario) => setItemToDelete(item);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setFuncionarios(prev => prev.filter(i => i.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Funcionário Excluído!", description: `O funcionário foi removido.` });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (item: Funcionario) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        return funcionarios.filter(item =>
            item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.cargo.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <p className="text-muted-foreground">Gerencie os dados pessoais, de contrato e dependentes dos seus funcionários.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Funcionários Cadastrados</CardTitle>
                            <CardDescription>{funcionarios.length} funcionários encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nome ou cargo..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Data de Admissão</TableHead>
                                    <TableHead className="text-right">Salário</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nome}</TableCell>
                                        <TableCell>{item.cargo}</TableCell>
                                        <TableCell>{format(new Date(item.dataAdmissao), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="text-right font-mono">{item.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
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

function ItemForm({ onSave, onOpenChange, item }: ItemFormProps) {
    const { toast } = useToast();
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [dataAdmissao, setDataAdmissao] = useState<Date | undefined>();
    const [cargo, setCargo] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [salario, setSalario] = useState(0);

    useEffect(() => {
        if (item) {
            setNome(item.nome);
            setCpf(item.cpf);
            setDataAdmissao(new Date(item.dataAdmissao));
            setCargo(item.cargo);
            setDepartamento(item.departamento);
            setSalario(item.salario);
        } else {
            setNome('');
            setCpf('');
            setDataAdmissao(undefined);
            setCargo('');
            setDepartamento('');
            setSalario(0);
        }
    }, [item]);
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome || !cpf || !dataAdmissao || !cargo || salario <= 0) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha todos os campos obrigatórios (*).'
            });
            return;
        }
        onSave({ nome, cpf, dataAdmissao: dataAdmissao.toISOString(), cargo, departamento, salario });
    };
    
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} Funcionário</DialogTitle>
                <DialogDescription>Preencha os dados do colaborador.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dataAdmissao && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dataAdmissao ? format(dataAdmissao, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={dataAdmissao} onSelect={setDataAdmissao} initialFocus locale={ptBR} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo *</Label>
                        <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="departamento">Departamento</Label>
                        <Input id="departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="salario">Salário (R$) *</Label>
                    <MoneyInput id="salario" value={salario} onValueChange={setSalario} />
                </div>
                
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
