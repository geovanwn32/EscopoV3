
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Eye, Pencil, Loader2 } from 'lucide-react';
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
import { AuditLog, logAudit } from '@/lib/audit-log';

export default function ParceirosPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [partners, setPartners] = useScopedData<Partner[]>('partners', []);
    const [, setAuditLogs] = useScopedData<AuditLog[]>('audit-trail-logs', []);


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
            logAudit(setAuditLogs, 'UPDATE', 'Parceiros', `Atualizou o parceiro "${partnerData.name}".`);
            setEditingPartner(null);
        } else {
            // Add new partner
            const newPartner = { ...partnerData, id: Date.now() };
            setPartners(prev => [...prev, newPartner]);
            toast({
                title: "Parceiro Salvo!",
                description: `O parceiro ${newPartner.name} foi adicionado com sucesso.`
            });
            logAudit(setAuditLogs, 'CREATE', 'Parceiros', `Criou o parceiro "${newPartner.name}" (Doc: ${newPartner.document}).`);
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
            logAudit(setAuditLogs, 'DELETE', 'Parceiros', `Excluiu o parceiro "${itemToDelete.name}".`);
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
                                    <TableHead>Endereço</TableHead>
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
                                            <TableCell>{partner.address}</TableCell>
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
                                        <TableCell colSpan={5} className="h-24 text-center">
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
    const [type, setType] = useState<'Cliente' | 'Fornecedor' | 'Transportadora' | undefined>(undefined);
    const [address, setAddress] = useState('');
    const [isQueryingCnpj, setIsQueryingCnpj] = useState(false);


     useEffect(() => {
        if (partner) {
            setName(partner.name);
            setDocument(partner.document);
            setType(partner.type);
            setAddress(partner.address || '');
        } else {
            setName('');
            setDocument('');
            setType(undefined);
            setAddress('');
        }
    }, [partner]);

    const handleCnpjQuery = async () => {
        const cnpj = document.replace(/\D/g, '');
        if (!cnpj || cnpj.length !== 14) {
            toast({ variant: 'destructive', title: 'CNPJ inválido', description: 'Por favor, insira um CNPJ válido para consulta.' });
            return;
        }

        setIsQueryingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'CNPJ não encontrado ou API indisponível.' }));
                throw new Error(errorData.message || `Erro: ${response.statusText}`);
            }
            const data = await response.json();
            
            setName(data.razao_social || '');
            setAddress(`${data.logradouro || ''}, ${data.numero || ''} - ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}`);

            toast({ title: 'CNPJ Consultado!', description: 'Os dados do parceiro foram preenchidos.' });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro na Consulta de CNPJ',
                description: error.message || 'Não foi possível buscar os dados do CNPJ.'
            });
        } finally {
            setIsQueryingCnpj(false);
        }
    }


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
        
        onSave({ name, document, type, address });
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
                    <Label htmlFor="document">CNPJ / CPF</Label>
                    <div className="flex items-center gap-2">
                        <Input id="document" value={document} onChange={(e) => setDocument(e.target.value)} required readOnly={isReadOnly} />
                         {!isReadOnly && (
                            <Button variant="outline" type="button" onClick={handleCnpjQuery} disabled={isQueryingCnpj}>
                                {isQueryingCnpj ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                <span className="sr-only">Consultar CNPJ</span>
                            </Button>
                        )}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="name">Nome / Razão Social</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required readOnly={isReadOnly} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} readOnly={isReadOnly} />
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

    