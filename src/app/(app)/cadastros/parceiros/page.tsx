
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Eye, Pencil, Loader2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Partner, PartnerType, PersonType } from '@/types/partner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCompany } from '@/hooks/use-company';
import { AuditLog, logAudit } from '@/lib/audit-log';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function ParceirosPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [partners, setPartners] = useScopedData<Partner[]>('partners', []);
    const [, setAuditLogs] = useScopedData<AuditLog[]>('audit-trail-logs', []);


    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Partner | null>(null);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSavePartner = (partnerData: Omit<Partner, 'id'>) => {
        if (editingPartner) {
            // Update existing partner
            setPartners(prev => prev.map(p => p.id === editingPartner.id ? { ...editingPartner, ...partnerData } : p));
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

    const filteredPartners = useMemo(() => {
        return partners.filter(partner => 
            partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.document.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [partners, searchTerm]);


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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cadastro de Parceiros</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus clientes, fornecedores e transportadoras.
                    </p>
                </div>
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
                                <Input 
                                    placeholder="Buscar por nome ou CNPJ..." 
                                    className="pl-9 w-full sm:w-64" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
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
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Contato</TableHead>
                                    <TableHead className="w-[64px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPartners.length > 0 ? (
                                    filteredPartners.map(partner => (
                                        <TableRow key={partner.id}>
                                            <TableCell className="font-medium">{partner.name}</TableCell>
                                            <TableCell>{partner.document}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{partner.type}</Badge>
                                            </TableCell>
                                            <TableCell className='text-muted-foreground text-xs'>
                                                <div>{partner.email}</div>
                                                <div>{partner.phone}</div>
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
    const [personType, setPersonType] = useState<PersonType>('JURIDICA');
    const [document, setDocument] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<PartnerType | undefined>(undefined);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState({
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });
    const [taxRegime, setTaxRegime] = useState('');
    const [isQueryingDoc, setIsQueryingDoc] = useState(false);


     useEffect(() => {
        if (partner) {
            setPersonType(partner.personType);
            setName(partner.name);
            setDocument(partner.document);
            setType(partner.type);
            setEmail(partner.email || '');
            setPhone(partner.phone || '');
            setAddress({
              zipCode: partner.address?.zipCode || '',
              street: partner.address?.street || '',
              number: partner.address?.number || '',
              complement: partner.address?.complement || '',
              neighborhood: partner.address?.neighborhood || '',
              city: partner.address?.city || '',
              state: partner.address?.state || '',
            });
            setTaxRegime(partner.taxRegime || '');
        } else {
            // Reset form
            setPersonType('JURIDICA');
            setName('');
            setDocument('');
            setType(undefined);
            setEmail('');
            setPhone('');
            setAddress({ zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
            setTaxRegime('');
        }
    }, [partner]);

    const handleDocQuery = async () => {
        const docValue = document.replace(/\D/g, '');
        if (personType === 'JURIDICA' && docValue.length !== 14) {
            toast({ variant: 'destructive', title: 'CNPJ inválido', description: 'Por favor, insira um CNPJ válido para consulta.' });
            return;
        }
        // Could add CPF validation/query here in the future
        if (personType === 'FISICA') return;

        setIsQueryingDoc(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${docValue}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'CNPJ não encontrado ou API indisponível.' }));
                throw new Error(errorData.message || `Erro: ${response.statusText}`);
            }
            const data = await response.json();
            
            setName(data.razao_social || '');
            setAddress({
                zipCode: data.cep || '',
                street: data.logradouro || '',
                number: data.numero || '',
                complement: data.complemento || '',
                neighborhood: data.bairro || '',
                city: data.municipio || '',
                state: data.uf || '',
            });
            setEmail(data.email || '');
            setPhone(data.ddd_telefone_1 || '');

            let regime = 'Outros';
            if (data.opcao_pelo_simples) regime = 'Simples Nacional';
            setTaxRegime(regime);

            toast({ title: 'CNPJ Consultado!', description: 'Os dados do parceiro foram preenchidos.' });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro na Consulta de CNPJ',
                description: error.message || 'Não foi possível buscar os dados do CNPJ.'
            });
        } finally {
            setIsQueryingDoc(false);
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
                description: 'Por favor, preencha Nome, Documento e Tipo para salvar.'
            });
            return;
        }
        
        onSave({ personType, name, document, type, address, email, phone, taxRegime });
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const onlyNumbers = value.replace(/\D/g, '');

        if (personType === 'JURIDICA') {
            let formatted = onlyNumbers;
            if (formatted.length > 2) formatted = `${formatted.slice(0, 2)}.${formatted.slice(2)}`;
            if (formatted.length > 6) formatted = `${formatted.slice(0, 6)}.${formatted.slice(6)}`;
            if (formatted.length > 10) formatted = `${formatted.slice(0, 10)}/${formatted.slice(10)}`;
            if (formatted.length > 15) formatted = `${formatted.slice(0, 15)}-${formatted.slice(15)}`;
            setDocument(formatted.slice(0, 18));
        } else { // FISICA
             let formatted = onlyNumbers;
            if (formatted.length > 3) formatted = `${formatted.slice(0, 3)}.${formatted.slice(3)}`;
            if (formatted.length > 7) formatted = `${formatted.slice(0, 7)}.${formatted.slice(7)}`;
            if (formatted.length > 11) formatted = `${formatted.slice(0, 11)}-${formatted.slice(11)}`;
            setDocument(formatted.slice(0, 14));
        }
    }
    
    const dialogTitle = isReadOnly ? "Visualizar Parceiro" : partner ? "Editar Parceiro" : "Novo Parceiro";
    const dialogDescription = isReadOnly ? "Visualize os dados do parceiro." : "Preencha os dados para adicionar ou editar um parceiro.";


    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>
                    {dialogDescription}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Tipo de Pessoa</Label>
                    <RadioGroup defaultValue="JURIDICA" value={personType} onValueChange={(v: PersonType) => { setPersonType(v); setDocument(''); }} disabled={isReadOnly}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="JURIDICA" id="r_juridica" />
                            <Label htmlFor="r_juridica">Pessoa Jurídica (CNPJ)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FISICA" id="r_fisica" />
                            <Label htmlFor="r_fisica">Pessoa Física (CPF)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="document">{personType === 'JURIDICA' ? 'CNPJ' : 'CPF'}</Label>
                        <div className="flex items-center gap-2">
                            <Input id="document" value={document} onChange={handleDocumentChange} required readOnly={isReadOnly} />
                             {personType === 'JURIDICA' && !isReadOnly && (
                                <Button variant="outline" type="button" onClick={handleDocQuery} disabled={isQueryingDoc}>
                                    {isQueryingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    <span className="sr-only">Consultar CNPJ</span>
                                </Button>
                            )}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="name">{personType === 'JURIDICA' ? 'Razão Social' : 'Nome Completo'}</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required readOnly={isReadOnly} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Parceiro</Label>
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
                     <div className="space-y-2">
                        <Label htmlFor="taxRegime">Regime Tributário</Label>
                        <Input id="taxRegime" value={taxRegime} onChange={e => setTaxRegime(e.target.value)} readOnly={isReadOnly} />
                    </div>
                </div>

                <Separator />
                <h3 className='text-md font-medium'>Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} readOnly={isReadOnly} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} readOnly={isReadOnly} />
                    </div>
                </div>

                <Separator />
                <h3 className='text-md font-medium'>Endereço</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input id="zipCode" value={address.zipCode} onChange={e => setAddress(p => ({...p, zipCode: e.target.value}))} readOnly={isReadOnly} />
                    </div>
                     <div className="space-y-2 col-span-2">
                        <Label htmlFor="street">Logradouro</Label>
                        <Input id="street" value={address.street} onChange={e => setAddress(p => ({...p, street: e.target.value}))} readOnly={isReadOnly} />
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input id="number" value={address.number} onChange={e => setAddress(p => ({...p, number: e.target.value}))} readOnly={isReadOnly} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input id="complement" value={address.complement} onChange={e => setAddress(p => ({...p, complement: e.target.value}))} readOnly={isReadOnly} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" value={address.neighborhood} onChange={e => setAddress(p => ({...p, neighborhood: e.target.value}))} readOnly={isReadOnly} />
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" value={address.city} onChange={e => setAddress(p => ({...p, city: e.target.value}))} readOnly={isReadOnly} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input id="state" value={address.state} onChange={e => setAddress(p => ({...p, state: e.target.value}))} readOnly={isReadOnly} />
                    </div>
                </div>


                <DialogFooter className='pt-4'>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {isReadOnly ? 'Fechar' : 'Cancelar'}
                    </Button>
                    {!isReadOnly && <Button type="submit">Salvar</Button>}
                </DialogFooter>
            </form>
        </DialogContent>
    );
}


    
    