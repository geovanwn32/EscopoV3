
'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function MinhaEmpresaPage() {
  const { currentCompany, companies, updateCompany, switchCompany } = useCompany();
  const { toast } = useToast();
  const router = useRouter();

  const [companyData, setCompanyData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    ie: '',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    classTributaria: '',
    cnae: '',
    logo: '',
  });

  useEffect(() => {
    if (currentCompany) {
      const activeCompany = companies.find(c => c.id === currentCompany);
      if (activeCompany) {
        setCompanyData({
          razaoSocial: activeCompany.name || '',
          nomeFantasia: activeCompany.data?.nomeFantasia || '',
          cnpj: activeCompany.data?.cnpj || '',
          ie: activeCompany.data?.ie || '',
          telefone: activeCompany.data?.telefone || '',
          email: activeCompany.data?.email || '',
          cep: activeCompany.data?.cep || '',
          logradouro: activeCompany.data?.logradouro || '',
          numero: activeCompany.data?.numero || '',
          complemento: activeCompany.data?.complemento || '',
          bairro: activeCompany.data?.bairro || '',
          cidade: activeCompany.data?.cidade || '',
          uf: activeCompany.data?.uf || '',
          classTributaria: activeCompany.data?.classTributaria || '',
          cnae: activeCompany.data?.cnae || '',
          logo: activeCompany.data?.logo || '',
        });
      }
    } else if (companies.length > 0) {
      // If no company is selected, select the first one
      switchCompany(companies[0].id);
    }
  }, [currentCompany, companies, switchCompany]);

  const handleInputChange = (field: keyof typeof companyData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!currentCompany) {
      toast({
        variant: 'destructive',
        title: 'Nenhuma empresa selecionada',
        description: 'Selecione uma empresa antes de salvar.',
      });
      return;
    }

    const updatedCompany = {
      id: currentCompany,
      name: companyData.razaoSocial || `Empresa ${currentCompany}`,
      data: companyData,
    };
    
    updateCompany(currentCompany, updatedCompany);

    toast({
      title: 'Dados Salvos!',
      description: 'As informações da empresa foram atualizadas com sucesso.',
    });
  };
  
  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Minha Empresa</h1>
          <p className="text-muted-foreground">
            Cadastre sua primeira empresa para começar.
          </p>
        </div>
        <Card>
            <CardHeader>
              <CardTitle>Nenhuma Empresa Encontrada</CardTitle>
              <CardDescription>Parece que você ainda não cadastrou nenhuma empresa. Preencha os dados abaixo para adicionar a primeira.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="razao-social">Razão Social</Label>
                        <Input id="razao-social" value={companyData.razaoSocial} onChange={(e) => handleInputChange('razaoSocial', e.target.value)} placeholder="Razão Social Completa" required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                        <Input id="nome-fantasia" value={companyData.nomeFantasia} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Nome Fantasia" />
                    </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={companyData.cnpj} onChange={(e) => handleInputChange('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
                 <div className='pt-4 flex justify-end'>
                  <Button type="submit">Salvar Empresa</Button>
                </div>
              </form>
            </CardContent>
          </Card>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Minha Empresa</h1>
        <p className="text-muted-foreground">
          Edite os dados cadastrais da sua empresa. O número de controle é o ID: <span className='font-bold'>{currentCompany}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
            <CardDescription>Informações principais de identificação da sua empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="razao-social">Razão Social</Label>
                    <Input id="razao-social" value={companyData.razaoSocial} onChange={(e) => handleInputChange('razaoSocial', e.target.value)} placeholder="Razão Social Completa" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                    <Input id="nome-fantasia" value={companyData.nomeFantasia} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Nome Fantasia" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={companyData.cnpj} onChange={(e) => handleInputChange('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual</Label>
                    <Input id="ie" value={companyData.ie} onChange={(e) => handleInputChange('ie', e.target.value)} placeholder="Inscrição Estadual" />
                </div>
            </div>
            <div className='pt-4 flex justify-end'>
            <Button onClick={handleSave}>Salvar Alterações</Button>
            </div>
        </CardContent>
    </Card>
    </div>
  );
}
