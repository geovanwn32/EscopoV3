
'use client';

import { useRouter } from 'next/navigation';
import { Building2, MoreVertical, PlusCircle, Trash2, Pencil, Eye, Loader2, Search, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useCompany, type Company } from '@/hooks/use-company';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const { companies, switchCompany, addCompany, deleteCompany, isLoaded, currentCompany } = useCompany();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleSelectCompany = (companyId: number) => {
    switchCompany(companyId);
    router.push('/dashboard');
  };

  const handleAddNewCompany = () => {
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    switchCompany(company.id, false); // Switch without navigating
    router.push('/minha-empresa');
  };
  
  const handleDeleteCompany = (companyId: number) => {
    setItemToDelete(companyId);
  }

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      const company = companies.find(c => c.id === itemToDelete);
      deleteCompany(itemToDelete);
      toast({
        variant: "destructive",
        title: "Empresa Excluída!",
        description: `A empresa "${company?.name}" foi removida com sucesso.`,
      });
      setItemToDelete(null);
    }
  }

  const handleSaveCompany = (companyData: Omit<Company, 'id'> & { data?: any }) => {
      addCompany(companyData.name, companyData.data);
      toast({ title: "Empresa Adicionada!", description: "A nova empresa foi criada com sucesso." });
      setIsFormOpen(false);
      router.push('/minha-empresa');
  };

  // Effect to automatically open the form if no companies exist
  useEffect(() => {
      if (isLoaded && companies.length === 0) {
          setIsFormOpen(true);
      }
  }, [companies, isLoaded]);


  return (
    <>
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 login-gradient">
            <div className="relative w-full max-w-5xl">
                {currentCompany && (
                  <Button asChild variant="ghost" className="absolute -top-14 left-0 z-10 text-card-foreground">
                      <Link href="/dashboard">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Voltar
                      </Link>
                  </Button>
                )}
                <div className="text-center mb-8 text-card-foreground">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Selecionar Empresa</h1>
                    <p className="text-muted-foreground">
                        Escolha com qual empresa você deseja trabalhar ou gerencie suas empresas.
                    </p>
                </div>

                {!isLoaded ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : companies.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {companies.map((company) => (
                    <Card
                        key={company.id}
                        className="relative flex flex-col justify-between transition-shadow hover:shadow-lg focus-within:shadow-lg"
                    >
                         <div className="absolute top-2 right-2 z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Ações</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleSelectCompany(company.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Selecionar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteCompany(company.id)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div 
                            onClick={() => handleSelectCompany(company.id)}
                            className='cursor-pointer flex-grow p-6 flex flex-col items-center justify-center text-center space-y-4'
                        >
                            <Avatar className="h-16 w-16">
                                {company.data?.logo ? 
                                    <AvatarImage src={company.data.logo} alt={company.name} /> : 
                                    <AvatarFallback className='bg-primary/10 text-primary'>
                                        <Building2 className='h-7 w-7'/>
                                    </AvatarFallback>
                                }
                            </Avatar>
                            <div className='space-y-1'>
                                <h2 className="text-lg font-semibold">{company.data?.nomeFantasia || company.name}</h2>
                                {company.data?.cnpj && <p className="text-sm text-muted-foreground">{company.data.cnpj}</p>}
                            </div>
                        </div>
                        <CardFooter className='p-2 border-t invisible'>
                            <div className='flex justify-end w-full'>
                               <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                    ))}

                    <Card 
                        onClick={handleAddNewCompany}
                        className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary border-dashed bg-card/50 hover:bg-card"
                        tabIndex={0}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <PlusCircle className="h-10 w-10 mb-4"/>
                                <h2 className="text-lg font-semibold">Adicionar Nova Empresa</h2>
                            </div>
                        </CardContent>
                    </Card>

                </div>
                ) : (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
                    <Card className="w-full max-w-lg text-center">
                        <CardHeader>
                            <CardTitle>Nenhuma Empresa Cadastrada</CardTitle>
                            <CardDescription>
                                Você precisa cadastrar sua primeira empresa para continuar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleAddNewCompany}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Cadastrar Primeira Empresa
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                )}
            </div>
        </div>
      <CompanyForm
        onSave={handleSaveCompany}
        onCancel={() => setIsFormOpen(false)}
      />
    </Dialog>
    <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a empresa e todos os seus dados associados.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>Confirmar Exclusão</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


interface CompanyFormProps {
  onSave: (data: Omit<Company, 'id'>) => void;
  onCancel: () => void;
}

function CompanyForm({ onSave, onCancel }: CompanyFormProps) {
  const { toast } = useToast();
  const [isQueryingCnpj, setIsQueryingCnpj] = useState(false);
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'cnpj') {
        const onlyNumbers = value.replace(/\D/g, '');
        let formattedCnpj = onlyNumbers;
        if (onlyNumbers.length > 2) formattedCnpj = `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2)}`;
        if (onlyNumbers.length > 5) formattedCnpj = `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5)}`;
        if (onlyNumbers.length > 8) formattedCnpj = `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8)}`;
        if (onlyNumbers.length > 12) formattedCnpj = `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8, 12)}-${onlyNumbers.slice(12, 14)}`;
        setFormData(prev => ({ ...prev, [field]: formattedCnpj }));
    } else {
        setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCnpjQuery = async () => {
    const cnpj = formData.cnpj.replace(/\D/g, '');
    if (!cnpj || cnpj.length !== 14) {
        toast({ variant: 'destructive', title: 'CNPJ inválido', description: 'Por favor, insira um CNPJ válido com 14 dígitos.' });
        return;
    }
    setIsQueryingCnpj(true);
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'CNPJ não encontrado ou API indisponível.' }));
            throw new Error(errorData.message);
        }
        const data = await response.json();
        setFormData(prev => ({
            ...prev,
            razaoSocial: data.razao_social || '',
            nomeFantasia: data.nome_fantasia || '',
        }));
        toast({ title: 'CNPJ Consultado!', description: 'Os dados da empresa foram preenchidos com sucesso.' });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Erro na Consulta',
            description: error.message || 'Não foi possível buscar os dados do CNPJ.'
        });
    } finally {
        setIsQueryingCnpj(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.razaoSocial) {
      toast({
        variant: 'destructive',
        title: 'Campo Obrigatório',
        description: 'A Razão Social é obrigatória. Consulte o CNPJ ou preencha manualmente.',
      });
      return;
    }
    onSave({
      name: formData.razaoSocial,
      data: {
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.nomeFantasia,
        cnpj: formData.cnpj,
      },
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
        <DialogDescription>
          Preencha os dados da empresa. Você pode consultar o CNPJ para preenchimento automático.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <div className="flex gap-2">
                <Input id="cnpj" value={formData.cnpj} onChange={(e) => handleInputChange('cnpj', e.target.value)} placeholder="00.000.000/0001-00" maxLength={18} />
                <Button type="button" variant="outline" onClick={handleCnpjQuery} disabled={isQueryingCnpj}>
                    {isQueryingCnpj ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Consultar</span>
                </Button>
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="razaoSocial">Razão Social</Label>
          <Input id="razaoSocial" value={formData.razaoSocial} onChange={e => handleInputChange('razaoSocial', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
          <Input id="nomeFantasia" value={formData.nomeFantasia} onChange={e => handleInputChange('nomeFantasia', e.target.value)} />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar e Continuar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

    