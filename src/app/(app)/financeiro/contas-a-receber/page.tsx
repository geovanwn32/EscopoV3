
'use client';

import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Pencil, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCompany } from '@/hooks/use-company';
import { Partner } from '@/types/partner';
import { Conta, StatusConta } from '@/types/financeiro';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ContasAReceberPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [partners] = useScopedData<Partner[]>('partners', []);
    const [contas, setContas] = useScopedData<Conta[]>('financeiro-contas-a-receber', []);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Conta | null>(null);
    const [editingItem, setEditingItem] = useState<Conta | null>(null);

    const handleSave = (contaData: Omit<Conta, 'id'>) => {
        if (editingItem) {
            setContas(prev => prev.map(c => c.id === editingItem.id ? { ...editingItem, ...contaData } : c));
            toast({ title: "Lançamento Atualizado!", description: "A conta a receber foi atualizada." });
        } else {
            const newConta: Conta = { ...contaData, id: Date.now() };
            setContas(prev => [...prev, newConta]);
            toast({ title: "Lançamento Adicionado!", description: "A nova conta a receber foi salva." });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (conta: Conta) => setItemToDelete(conta);

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setContas(prev => prev.filter(c => c.id !== itemToDelete.id));
            toast({ variant: "destructive", title: "Lançamento Excluído!", description: `O lançamento foi removido.` });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (conta: Conta) => {
        setEditingItem(conta);
        setIsDialogOpen(true);
    };

    const handleStatusChange = (id: number, newStatus: StatusConta) => {
        setContas(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        toast({ title: "Status Alterado!", description: "O status da conta foi atualizado." });
    };

    const getStatusBadgeVariant = (status: StatusConta) => {
        switch (status) {
            case 'Recebido': return 'default';
            case 'Atrasado': return 'destructive';
            case 'Pendente': return 'secondary';
            default: return 'outline';
        }
    };
    
    const sortedContas = useMemo(() => {
        return [...contas].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [contas]);
    
    useEffect(() => {
      // Logic to update status based on date
      const today = new Date();
      today.setHours(0,0,0,0); // Normalize today's date

      const updatedContas = contas.map(c => {
        if (c.status === 'Pendente') {
          const dueDate = new Date(c.dueDate);
          if (dueDate < today) {
            return { ...c, status: 'Atrasado' as StatusConta };
          }
        }
        return c;
      });
      // Avoid infinite loop by checking if an update is actually needed
      if(JSON.stringify(updatedContas) !== JSON.stringify(contas)) {
        setContas(updatedContas);
      }

    }, [contas, setContas]);


    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Contas a Receber</h1>
                <p className="text-muted-foreground">Acompanhe os recebimentos de clientes.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lançamentos Futuros e Pendentes</CardTitle>
                            <CardDescription>{contas.length} lançamentos encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por cliente..." className="pl-9 w-full sm:w-64" />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingItem(null); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Novo Lançamento</Button>
                                </DialogTrigger>
                                <ContaForm 
                                    onSave={handleSave} 
                                    onOpenChange={setIsDialogOpen}
                                    partners={partners.filter(p => p.type === 'Cliente')}
                                    conta={editingItem}
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
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedContas.length > 0 ? sortedContas.map(conta => (
                                    <TableRow key={conta.id}>
                                        <TableCell className="font-medium">{conta.partnerName}</TableCell>
                                        <TableCell className="text-muted-foreground">{conta.description}</TableCell>
                                        <TableCell>{format(new Date(conta.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {conta.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusBadgeVariant(conta.status)}>{conta.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Alterar Status</DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(conta.id, 'Pendente')}>Pendente</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(conta.id, 'Recebido')}>Recebido</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(conta.id, 'Atrasado')}>Atrasado</DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem onClick={() => handleEditClick(conta)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(conta)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">Nenhuma conta a receber encontrada.</TableCell>
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
                        <AlertDialogDescription>Essa ação não pode ser desfeita e excluirá permanentemente o lançamento.</AlertDialogDescription>
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

interface ContaFormProps {
    onSave: (conta: Omit<Conta, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    partners: Partner[];
    conta: Conta | null;
}

function ContaForm({ onSave, onOpenChange, partners, conta }: ContaFormProps) {
    const { toast } = useToast();
    const [partnerId, setPartnerId] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [status, setStatus] = useState<StatusConta>('Pendente');

     useEffect(() => {
        if (conta) {
            const partner = partners.find(p => p.name === conta.partnerName);
            setPartnerId(partner?.id.toString());
            setDescription(conta.description);
            setAmount(conta.amount);
            setDueDate(new Date(conta.dueDate));
            setStatus(conta.status);
        } else {
            setPartnerId(undefined);
            setDescription('');
            setAmount('');
            setDueDate(undefined);
            setStatus('Pendente');
        }
    }, [conta, partners]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedPartner = partners.find(p => p.id.toString() === partnerId);
        if (!selectedPartner || !dueDate || amount === '') {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha todos os campos obrigatórios.'
            });
            return;
        }
        
        onSave({ 
            partnerName: selectedPartner.name, 
            description, 
            amount: Number(amount), 
            dueDate: dueDate.toISOString(), 
            status 
        });
    };
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{conta ? 'Editar' : 'Novo'} Lançamento a Receber</DialogTitle>
                <DialogDescription>Preencha os dados da conta a receber.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="partner">Cliente</Label>
                    <Select value={partnerId} onValueChange={setPartnerId} required>
                        <SelectTrigger id="partner"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                        <SelectContent>
                            {partners.length > 0 ? partners.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                            )) : <div className='p-4 text-sm text-muted-foreground'>Nenhum cliente cadastrado.</div>}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Venda de mercadorias"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || '')} required placeholder='0,00'/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Data de Vencimento</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dueDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus locale={ptBR} />
                            </PopoverContent>
                        </Popover>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as StatusConta)} required>
                        <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                            <SelectItem value="Recebido">Recebido</SelectItem>
                            <SelectItem value="Atrasado">Atrasado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

    
