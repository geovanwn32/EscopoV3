'use client';

import { useRouter } from 'next/navigation';
import { Building2, PlusCircle } from 'lucide-react';

import { useCompany } from '@/hooks/use-company';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const { companies, switchCompany, addCompany } = useCompany();

  const handleSelectCompany = (companyId: number) => {
    switchCompany(companyId);
    router.push('/dashboard');
  };

  const handleAddNewCompany = () => {
    addCompany();
    // The addCompany function will redirect to /minha-empresa
  };

  if (companies.length === 0) {
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Selecionar Empresa</h1>
        <p className="text-muted-foreground">
          Escolha com qual empresa você deseja trabalhar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {companies.map((company) => (
          <Card
            key={company.id}
            onClick={() => handleSelectCompany(company.id)}
            className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
            tabIndex={0}
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
  );
}