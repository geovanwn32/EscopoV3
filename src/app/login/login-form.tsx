

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipagem para os dados do formulário
type FormInputs = {
  fullname?: string;
  email: string;
  password: string;
  remember?: boolean;
};

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
alidar o CNPJ
            if (personType === 'JURIDICA' && docValue.length !== 14) {
                toast({
                    variant: 'destructive',
                    title: 'CNPJ inválido',
                    description: 'Por favor, insira um CNPJ válido com 14 dígitos.'
                });
                return;
            }
            if (personType === 'FISICA' && docValue.length !== 11) {
                toast({
                    variant: 'destructive',
                    title: 'CPF inválido',
                    description: 'Por favor, insira um CPF válido com 11 dígitos.'
                });
                return;
            }

            if (isQueryingDoc) return;
            setIsQueryingDoc(true);
            try {
                // Simulação de consulta a uma API de CNPJ/CPF
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                if (personType === 'JURIDICA') {
                     // Exemplo de dados para CNPJ (substitua por uma API real se necessário)
                     setName('Empresa Exemplo LTDA');
                     setEmail('contato@empresaexemplo.com');
                     setPhone('(11) 99999-9999');
                     setAddress({
                         zipCode: '01001-000',
                         street: 'Praça da Sé',
                         number: '100',
                         complement: 'Lado A',
                         neighborhood: 'Sé',
                         city: 'São Paulo',
                         state: 'SP',
                     });
                     setTaxRegime('Simples Nacional');
                     toast({ title: 'CNPJ Consultado!', description: 'Os dados do parceiro foram preenchidos.' });
                } else {
                    // Simulação para CPF
                     toast({ title: 'Consulta de CPF', description: 'Função de consulta de CPF não implementada.' });
                }
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Erro na Consulta',
                    description: error.message || 'Não foi possível buscar os dados do documento.'
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
                                 {!isReadOnly && (
                                    <Button variant="outline" type="button" onClick={handleDocQuery} disabled={isQueryingDoc}>
                                        {isQueryingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        <span className="sr-only">Consultar Documento</span>
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

    