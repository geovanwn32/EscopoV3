
'use client';

import { useRouter } from 'next/navigation';
import { Building2, MoreVertical, PlusCircle, Trash2, Pencil, Eye } from 'lucide-react';
import { useState } from 'react';

import { useCompany, type Company } from '@/hooks/use-company';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const { companies, switchCompany, addCompany, deleteCompany, updateCompany } = useCompany();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleSelectCompany = (companyId: number) => {
    switchCompany(companyId);
    router.push('/dashboard');
  };

  const handleAddNewCompany = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
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

  const handleSaveCompany = (companyData: Omit<Company, 'data'> & { data?: any }) => {
    if (editingCompany) {
      updateCompany(editingCompany.id, { ...editingCompany, ...companyData });
      toast({ title: "Empresa Atualizada!", description: "Os dados da empresa foram atualizados." });
    } else {
      addCompany(companyData.name, companyData.data);
      toast({ title: "Empresa Adicionada!", description: "A nova empresa foi criada com sucesso." });
    }
    setIsFormOpen(false);
    setEditingCompany(null);
  };


  if (companies.length === 0 && itemToDelete === null) {
    return (
      <Dialog open={isFormOpen || companies.length === 0} onOpenChange={setIsFormOpen}>
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
             <Card className="w-full max-w-lg text-center">
                 <CardHeader>
                     <CardTitle>Nenhuma Empresa Cadastrada</CardTitle>
                     <CardDescription>
                         Você precisa cadastrar sua primeira empresa para continuar.
                     </CardDescription>
                 </CardHeader>
                 <CardContent>
                  <DialogTrigger asChild>
                     <Button onClick={handleAddNewCompany}>
                         <PlusCircle className="mr-2 h-4 w-4" />
                         Cadastrar Primeira Empresa
                     </Button>
                  </DialogTrigger>
                 </CardContent>
             </Card>
         </div>
         <CompanyForm
            company={null}
            onSave={handleSaveCompany}
            onCancel={() => setIsFormOpen(false)}
          />
      </Dialog>
    );
  }

  return (
    <>
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Selecionar Empresa</h1>
          <p className="text-muted-foreground">
            Escolha com qual empresa você deseja trabalhar ou gerencie suas empresas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="flex flex-col justify-between transition-shadow hover:shadow-lg focus-within:shadow-lg"
            >
              <div 
                onClick={() => handleSelectCompany(company.id)}
                className='cursor-pointer flex-grow'
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl font-bold bg-muted text-muted-foreground">
                        {company.name ? company.name.charAt(0).toUpperCase() : '?'}
                      </AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold">{company.name || `Empresa (ID: ${company.id})`}</h2>
                  {company.data?.cnpj && <p className="text-sm text-muted-foreground">{company.data.cnpj}</p>}
                </CardContent>
              </div>
              <CardFooter className='p-2 border-t'>
                  <div className='flex justify-end w-full'>
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
                                  Selecionar / Visualizar
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
              </CardFooter>
            </Card>
          ))}

          <DialogTrigger asChild>
            <Card 
                onClick={handleAddNewCompany}
                className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary border-dashed"
                tabIndex={0}
            >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <PlusCircle className="h-10 w-10 mb-4"/>
                        <h2 className="text-lg font-semibold">Adicionar Nova Empresa</h2>
                    </div>
                </CardContent>
            </Card>
          </DialogTrigger>

        </div>
      </div>
      <CompanyForm
        company={editingCompany}
        onSave={handleSaveCompany}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingCompany(null);
        }}
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
  company: Company | null;
  onSave: (data: Omit<Company, 'id'>) => void;
  onCancel: () => void;
}

function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
  });

  useState(() => {
    if (company) {
      setFormData({
        razaoSocial: company.name || '',
        nomeFantasia: company.data?.nomeFantasia || '',
        cnpj: company.data?.cnpj || '',
      });
    } else {
      setFormData({
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
      });
    }
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.razaoSocial,
      data: {
        nomeFantasia: formData.nomeFantasia,
        cnpj: formData.cnpj,
      },
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{company ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}</DialogTitle>
        <DialogDescription>
          Preencha os dados da empresa. O número de controle é gerado automaticamente.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="razaoSocial">Razão Social</Label>
          <Input id="razaoSocial" value={formData.razaoSocial} onChange={e => handleInputChange('razaoSocial', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
          <Input id="nomeFantasia" value={formData.nomeFantasia} onChange={e => handleInputChange('nomeFantasia', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input id="cnpj" value={formData.cnpj} onChange={e => handleInputChange('cnpj', e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

