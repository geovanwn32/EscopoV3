
'use client';

import { useRouter } from 'next/navigation';
import { Building2, MoreVertical, PlusCircle, Trash2, Pencil, Eye } from 'lucide-react';

import { useCompany } from '@/hooks/use-company';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const { companies, switchCompany, addCompany, deleteCompany } = useCompany();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSelectCompany = (companyId: number) => {
    switchCompany(companyId);
    router.push('/dashboard');
  };

  const handleAddNewCompany = () => {
    addCompany();
  };

  const handleEditCompany = (companyId: number) => {
    switchCompany(companyId, false); // Switch without navigating
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


  if (companies.length === 0 && itemToDelete === null) { // Check itemToDelete to avoid flicker on last delete
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
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
    );
  }

  return (
    <>
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
                      {company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{company.name}</h2>
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
                            <DropdownMenuItem onClick={() => handleEditCompany(company.id)}>
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

      </div>
    </div>
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
