'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Eye, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Partner } from '@/types/partner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCompany } from '@/hooks/use-company';

export default function ParceirosPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [partners, setPartners] = useScopedData<Partner[]>('partners', []);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Partner | null>(null);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    
    const handleSavePartner = (partnerData: Omit<Partner, 'id'>) => {
        if (editingPartner) {
            // Update existing partner
            setPartners(prev => prev.map(p => p.id === editingPartner.id ? { ...p, ...partnerData } : p));
            toast({
                title: "Parceiro Atualizado!",
                description: `O parceiro ${partnerData.name} foi atualizado com sucesso.`
            });
            setEditingPartner(null);
        } else {
            // Add new partner
            const newPartner = { ...partnerData, id: Date.now() };
            setPartners(prev => [...prev, newPartner]);
            toast({
                title: "Parceiro Salvo!",
                description: `O parceiro ${newPartner.name} foi adicionado com sucesso.`
            });
        }
        setIsDialogOpen(false);
    };

    const handleDeleteClick = (partner: Partner) => {
        setItemToDelete(partner);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setPartners(prev => prev.filter(p => p.id !== itemToDelete.id));
            toast({
                variant: "destructive",
                title: "Parceiro Excluído!",
                description: `O parceiro ${itemToDelete.name} foi removido.`
            });
            setItemToDelete(null);
        }
    };
    
    const handleEditClick = (partner: Partner) => {
        setEditingPartner(partner);
        setIsReadOnly(false);
        setIsDialogOpen(true);
    };

    const handleViewClick = (partner: Partner) => {
        setEditingPartner(partner);
        setIsReadOnly(true);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingPartner(null);
            setIsReadOnly(false);
        }
    }


    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Cadastro de Parceiros</h1>
                <p className="text-muted-foreground">
                    Gerencie seus clientes, fornecedores e transportadoras.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Parceiros Cadastrados</CardTitle>
                            <CardDescription>{partners.length} parceiros encontrados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nome ou CNPJ..." className="pl-9 w-full sm:w-64" />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Novo Parceiro
                                    </Button>
                                </DialogTrigger>
                                <PartnerForm 
                                    onSave={handleSavePartner} 
                                    onOpenChange={handleDialogChange}
                                    partner={editingPartner}
                                    isReadOnly={isReadOnly}
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
                                    <TableHead>Nome / Razão Social</TableHead>
                                    <TableHead>CNPJ / CPF</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.length > 0 ? (
                                    partners.map(partner => (
                                        <TableRow key={partner.id}>
                                            <TableCell className="font-medium">{partner.name}</TableCell>
                                            <TableCell>{partner.document}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{partner.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Ações</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewClick(partner)}><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditClick(partner)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteClick(partner)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Nenhum parceiro cadastrado.
                                        </TableCell>
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
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o parceiro 
                            <span className="font-bold"> "{itemToDelete?.name}"</span>.
                        </AlertDialogDescription>
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

interface PartnerFormProps {
    onSave: (partner: Omit<Partner, 'id'>) => void;
    onOpenChange: (open: boolean) => void;
    partner: Partner | null;
    isReadOnly: boolean;
}

function PartnerForm({ onSave, onOpenChange, partner, isReadOnly }: PartnerFormProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [type, setType] = useState<'Cliente' | 'Fornecedor' | 'Transportadora'>();

     useEffect(() => {
        if (partner) {
            setName(partner.name);
            setDocument(partner.document);
            setType(partner.type);
        } else {
            setName('');
            setDocument('');
            setType(undefined);
        }
    }, [partner]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) {
            onOpenChange(false);
            return;
        }

        if (!name || !document || !type) {
            toast({
                variant: 'destructive',
                title: 'Campos Obrigatórios',
                description: 'Por favor, preencha todos os campos para salvar o parceiro.'
            });
            return;
        }
        
        onSave({ name, document, type });
    };
    
    const dialogTitle = isReadOnly ? "Visualizar Parceiro" : partner ? "Editar Parceiro" : "Novo Parceiro";
    const dialogDescription = isReadOnly ? "Visualize os dados do parceiro." : "Preencha os dados para adicionar ou editar um parceiro.";


    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>
                    {dialogDescription}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome / Razão Social</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required readOnly={isReadOnly} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="document">CNPJ / CPF</Label>
                    <Input id="document" value={document} onChange={(e) => setDocument(e.target.value)} required readOnly={isReadOnly} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={type} onValueChange={(value) => setType(value as any)} required disabled={isReadOnly}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                            <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                            <SelectItem value="Transportadora">Transportadora</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {isReadOnly ? 'Fechar' : 'Cancelar'}
                    </Button>
                    {!isReadOnly && <Button type="submit">Salvar</Button>}
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
