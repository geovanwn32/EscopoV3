
'use client';
import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, ArrowLeft, CalendarIcon, X, Loader2 } from 'lucide-react';
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
import { Funcionario, Dependente, AnotacaoCarteira } from '@/types/pessoal';
import { MoneyInput } from '@/components/ui/money-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';


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
    const [isQueryingCep, setIsQueryingCep] = useState(false);
    const [formData, setFormData] = useState<Omit<Funcionario, 'id'>>({
        nome: '',
        cpf: '',
        dataAdmissao: '',
        cargo: '',
        departamento: '',
        salario: 0,
        dataNascimento: '',
        genero: 'Outro',
        estadoCivil: 'Solteiro(a)',
        nacionalidade: 'Brasileira',
        rg: '',
        pis: '',
        endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
        contato: { telefone: '', email: '' },
        contrato: { horarioTrabalho: '', tipoContrato: 'CLT' },
        dadosBancarios: { banco: '', agencia: '', conta: '' },
        dependentes: [],
        anotacoesCarteira: [],
    });

    useEffect(() => {
        if (item) {
            setFormData({
                nome: item.nome || '',
                cpf: item.cpf || '',
                dataAdmissao: item.dataAdmissao || '',
                cargo: item.cargo || '',
                departamento: item.departamento || '',
                salario: item.salario || 0,
                dataNascimento: item.dataNascimento || '',
                genero: item.genero || 'Outro',
                estadoCivil: item.estadoCivil || 'Solteiro(a)',
                nacionalidade: item.nacionalidade || 'Brasileira',
                rg: item.rg || '',
                pis: item.pis || '',
                endereco: item.endereco || { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
                contato: item.contato || { telefone: '', email: '' },
                contrato: item.contrato || { horarioTrabalho: '', tipoContrato: 'CLT' },
                dadosBancarios: item.dadosBancarios || { banco: '', agencia: '', conta: '' },
                dependentes: item.dependentes || [],
                anotacoesCarteira: item.anotacoesCarteira || [],
            });
        } else {
            setFormData({
                nome: '', cpf: '', dataAdmissao: '', cargo: '', departamento: '', salario: 0, dataNascimento: '',
                genero: 'Outro', estadoCivil: 'Solteiro(a)', nacionalidade: 'Brasileira', rg: '', pis: '',
                endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
                contato: { telefone: '', email: '' }, contrato: { horarioTrabalho: '', tipoContrato: 'CLT' },
                dadosBancarios: { banco: '', agencia: '', conta: '' }, dependentes: [], anotacoesCarteira: [],
            });
        }
    }, [item]);
    

    const handleInputChange = (field: keyof Omit<Funcionario, 'id'>, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (section: 'endereco' | 'contato' | 'contrato' | 'dadosBancarios', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            }
        }))
    }

    const addDependente = () => {
        setFormData(prev => ({
            ...prev,
            dependentes: [...(prev.dependentes || []), { id: Date.now(), nome: '', cpf: '', dataNascimento: '' }]
        }));
    };

    const removeDependente = (id: number) => {
        setFormData(prev => ({
            ...prev,
            dependentes: prev.dependentes?.filter(d => d.id !== id)
        }));
    };

    const handleDependenteChange = (id: number, field: keyof Omit<Dependente, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            dependentes: prev.dependentes?.map(d => d.id === id ? { ...d, [field]: value } : d)
        }));
    };

    const addAnotacao = () => {
        setFormData(prev => ({
            ...prev,
            anotacoesCarteira: [...(prev.anotacoesCarteira || []), { id: Date.now(), data: new Date().toISOString(), descricao: '' }]
        }));
    };

    const removeAnotacao = (id: number) => {
        setFormData(prev => ({
            ...prev,
            anotacoesCarteira: prev.anotacoesCarteira?.filter(a => a.id !== id)
        }));
    };

    const handleAnotacaoChange = (id: number, field: keyof Omit<AnotacaoCarteira, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            anotacoesCarteira: prev.anotacoesCarteira?.map(a => a.id === id ? { ...a, [field]: value } : a)
        }));
    };

    const handleCepQuery = async () => {
        const cep = formData.endereco.cep.replace(/\D/g, '');
        if (!cep || cep.length !== 8) {
            toast({ variant: 'destructive', title: 'CEP inválido', description: 'Por favor, insira um CEP válido com 8 dígitos.' });
            return;
        }

        setIsQueryingCep(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'CEP não encontrado ou API indisponível.' }));
                throw new Error(errorData.message || `Erro: ${response.statusText}`);
            }
            const data = await response.json();

            setFormData(prev => ({
                ...prev,
                endereco: {
                    ...prev.endereco,
                    logradouro: data.street || '',
                    bairro: data.neighborhood || '',
                    cidade: data.city || '',
                    uf: data.state || '',
                }
            }));

            toast({ title: 'CEP Consultado!', description: 'O endereço foi preenchido com sucesso.' });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro na Consulta de CEP',
                description: error.message || 'Não foi possível buscar os dados do CEP.'
            });
        } finally {
            setIsQueryingCep(false);
        }
    }


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nome || !formData.cpf || !formData.dataAdmissao || !formData.cargo || formData.salario <= 0) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha todos os campos obrigatórios (*).'
            });
            return;
        }
        onSave(formData);
    };
    
    return (
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>{item ? 'Editar' : 'Novo'} Funcionário</DialogTitle>
                <DialogDescription>Preencha os dados do colaborador para realizar a admissão.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                 <Tabs defaultValue="pessoal" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 mb-4">
                        <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="contrato">Contrato</TabsTrigger>
                        <TabsTrigger value="endereco">Endereço/Contato</TabsTrigger>
                        <TabsTrigger value="bancario">Dados Bancários</TabsTrigger>
                        <TabsTrigger value="dependentes">Dependentes</TabsTrigger>
                        <TabsTrigger value="anotacoes">Anotações CTPS</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pessoal" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo *</Label>
                            <Input id="nome" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF *</Label>
                                <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rg">RG</Label>
                                <Input id="rg" value={formData.rg} onChange={(e) => handleInputChange('rg', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pis">PIS/PASEP</Label>
                                <Input id="pis" value={formData.pis} onChange={(e) => handleInputChange('pis', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                <Input id="dataNascimento" type="date" value={formData.dataNascimento?.split('T')[0]} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="genero">Gênero</Label>
                                <Select value={formData.genero} onValueChange={(v) => handleInputChange('genero', v)}><SelectTrigger id="genero"><SelectValue/></SelectTrigger><SelectContent>
                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                    <SelectItem value="Feminino">Feminino</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent></Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="estadoCivil">Estado Civil</Label>
                                 <Select value={formData.estadoCivil} onValueChange={(v) => handleInputChange('estadoCivil', v)}><SelectTrigger id="estadoCivil"><SelectValue/></SelectTrigger><SelectContent>
                                    <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                                    <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                                    <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                                    <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                                    <SelectItem value="União Estável">União Estável</SelectItem>
                                </SelectContent></Select>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="contrato" className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                                <Input id="dataAdmissao" type="date" value={formData.dataAdmissao?.split('T')[0]} onChange={(e) => handleInputChange('dataAdmissao', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cargo">Cargo *</Label>
                                <Input id="cargo" value={formData.cargo} onChange={(e) => handleInputChange('cargo', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="departamento">Departamento</Label>
                                <Input id="departamento" value={formData.departamento} onChange={(e) => handleInputChange('departamento', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="salario">Salário (R$) *</Label>
                                <MoneyInput id="salario" value={formData.salario} onValueChange={(v) => handleInputChange('salario', v)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                                 <Select value={formData.contrato.tipoContrato} onValueChange={(v) => handleNestedChange('contrato', 'tipoContrato', v)}><SelectTrigger id="tipoContrato"><SelectValue/></SelectTrigger><SelectContent>
                                    <SelectItem value="CLT">CLT</SelectItem>
                                    <SelectItem value="Estágio">Estágio</SelectItem>
                                    <SelectItem value="PJ">PJ</SelectItem>
                                    <SelectItem value="Temporário">Temporário</SelectItem>
                                </SelectContent></Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="horarioTrabalho">Horário de Trabalho</Label>
                                <Input id="horarioTrabalho" value={formData.contrato.horarioTrabalho} onChange={(e) => handleNestedChange('contrato', 'horarioTrabalho', e.target.value)} placeholder="Ex: 08:00 às 18:00"/>
                            </div>
                        </div>
                    </TabsContent>
                    
                     <TabsContent value="endereco" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <div className="flex gap-2">
                                    <Input id="cep" value={formData.endereco.cep} onChange={(e) => handleNestedChange('endereco', 'cep', e.target.value)} />
                                    <Button type="button" variant="outline" onClick={handleCepQuery} disabled={isQueryingCep}>
                                        {isQueryingCep ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="logradouro">Logradouro</Label>
                                <Input id="logradouro" value={formData.endereco.logradouro} onChange={(e) => handleNestedChange('endereco', 'logradouro', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input id="numero" value={formData.endereco.numero} onChange={(e) => handleNestedChange('endereco', 'numero', e.target.value)} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input id="bairro" value={formData.endereco.bairro} onChange={(e) => handleNestedChange('endereco', 'bairro', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="complemento">Complemento</Label>
                                <Input id="complemento" value={formData.endereco.complemento} onChange={(e) => handleNestedChange('endereco', 'complemento', e.target.value)} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2 col-span-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" value={formData.endereco.cidade} onChange={(e) => handleNestedChange('endereco', 'cidade', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="uf">UF</Label>
                                <Input id="uf" value={formData.endereco.uf} onChange={(e) => handleNestedChange('endereco', 'uf', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input id="telefone" value={formData.contato.telefone} onChange={(e) => handleNestedChange('contato', 'telefone', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="email" value={formData.contato.email} onChange={(e) => handleNestedChange('contato', 'email', e.target.value)} />
                            </div>
                        </div>
                    </TabsContent>

                     <TabsContent value="bancario" className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="banco">Banco</Label>
                                <Input id="banco" value={formData.dadosBancarios.banco} onChange={(e) => handleNestedChange('dadosBancarios', 'banco', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agencia">Agência</Label>
                                <Input id="agencia" value={formData.dadosBancarios.agencia} onChange={(e) => handleNestedChange('dadosBancarios', 'agencia', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="conta">Conta</Label>
                                <Input id="conta" value={formData.dadosBancarios.conta} onChange={(e) => handleNestedChange('dadosBancarios', 'conta', e.target.value)} />
                            </div>
                         </div>
                    </TabsContent>

                    <TabsContent value="dependentes" className="space-y-4">
                        {formData.dependentes?.map((dep, index) => (
                             <div key={dep.id} className="rounded-lg border p-4 space-y-4 relative">
                                <h4 className='font-medium'>Dependente {index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-2 col-span-2">
                                        <Label htmlFor={`dep-nome-${dep.id}`}>Nome Completo</Label>
                                        <Input id={`dep-nome-${dep.id}`} value={dep.nome} onChange={(e) => handleDependenteChange(dep.id, 'nome', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`dep-nasc-${dep.id}`}>Data de Nascimento</Label>
                                        <Input id={`dep-nasc-${dep.id}`} type="date" value={dep.dataNascimento.split('T')[0]} onChange={(e) => handleDependenteChange(dep.id, 'dataNascimento', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`dep-cpf-${dep.id}`}>CPF</Label>
                                        <Input id={`dep-cpf-${dep.id}`} value={dep.cpf} onChange={(e) => handleDependenteChange(dep.id, 'cpf', e.target.value)} />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeDependente(dep.id)}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addDependente}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Dependente
                        </Button>
                    </TabsContent>
                    <TabsContent value="anotacoes" className="space-y-4">
                        {formData.anotacoesCarteira?.map((anotacao, index) => (
                             <div key={anotacao.id} className="rounded-lg border p-4 space-y-4 relative">
                                <h4 className='font-medium'>Anotação {index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor={`anot-data-${anotacao.id}`}>Data</Label>
                                        <Input id={`anot-data-${anotacao.id}`} type="date" value={anotacao.data.split('T')[0]} onChange={(e) => handleAnotacaoChange(anotacao.id, 'data', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`anot-desc-${anotacao.id}`}>Descrição</Label>
                                    <Textarea id={`anot-desc-${anotacao.id}`} value={anotacao.descricao} onChange={(e) => handleAnotacaoChange(anotacao.id, 'descricao', e.target.value)} />
                                </div>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeAnotacao(anotacao.id)}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addAnotacao}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Anotação
                        </Button>
                    </TabsContent>
                </Tabs>
                <DialogFooter className='pt-6'>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar Admissão</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
