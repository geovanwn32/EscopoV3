
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
      name: companyData.razaoSocial,
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
                <div className="space-y-2">
                  <Label htmlFor="razao-social">Razão Social</Label>
                  <Input id="razao-social" value={companyData.razaoSocial} onChange={(e) => handleInputChange('razaoSocial', e.target.value)} placeholder="Razão Social Completa" required/>
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
          Edite os dados cadastrais da sua empresa, incluindo informações para o eSocial e logomarca.
        </p>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="esocial">eSocial</TabsTrigger>
          <TabsTrigger value="logo">Logomarca</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Dados Gerais</CardTitle>
              <CardDescription>Informações principais de identificação da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="razao-social">Razão Social</Label>
                  <Input id="razao-social" value={companyData.razaoSocial} onChange={(e) => handleInputChange('razaoSocial', e.target.value)} placeholder="Razão Social Completa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                  <Input id="nome-fantasia" value={companyData.nomeFantasia} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Nome Fantasia" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={companyData.cnpj} onChange={(e) => handleInputChange('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ie">Inscrição Estadual</Label>
                  <Input id="ie" value={companyData.ie} onChange={(e) => handleInputChange('ie', e.target.value)} placeholder="Inscrição Estadual" />
                </div>
              </div>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={companyData.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} type="tel" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={companyData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" placeholder="contato@suaempresa.com" />
                </div>
              </div>
              <div className='pt-4 flex justify-end'>
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco">
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Endereço fiscal da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" value={companyData.cep} onChange={(e) => handleInputChange('cep', e.target.value)} placeholder="00000-000" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input id="logradouro" value={companyData.logradouro} onChange={(e) => handleInputChange('logradouro', e.target.value)} placeholder="Nome da Rua, Avenida, etc." />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" value={companyData.numero} onChange={(e) => handleInputChange('numero', e.target.value)} placeholder="Nº" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" value={companyData.complemento} onChange={(e) => handleInputChange('complemento', e.target.value)} placeholder="Apto, Bloco, etc." />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={companyData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)} placeholder="Bairro" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={companyData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)} placeholder="Cidade" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="uf">UF</Label>
                  <Input id="uf" value={companyData.uf} onChange={(e) => handleInputChange('uf', e.target.value)} placeholder="UF" />
                </div>
              </div>
              <div className='pt-4 flex justify-end'>
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esocial">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do eSocial</CardTitle>
              <CardDescription>Parâmetros necessários para a geração dos arquivos do eSocial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-tributaria">Classificação Tributária</Label>
                <Input id="class-tributaria" value={companyData.classTributaria} onChange={(e) => handleInputChange('classTributaria', e.target.value)} placeholder="Ex: 99 - Pessoas Jurídicas em Geral" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnae">CNAE Preponderante</Label>
                <Input id="cnae" value={companyData.cnae} onChange={(e) => handleInputChange('cnae', e.target.value)} placeholder="Ex: 6201-5/01 - Desenvolvimento de programas" />
              </div>
              <div className='pt-4 flex justify-end'>
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Logomarca</CardTitle>
              <CardDescription>Faça o upload da logomarca da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 rounded-lg">
                        <AvatarImage src={companyData.logo || ''} alt="Logo da Empresa"/>
                        <AvatarFallback className='rounded-lg'>LOGO</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="logo-upload" className='text-base'>Atualizar logo</Label>
                        <p className='text-sm text-muted-foreground'>Recomendado: 200x200px, PNG ou JPG.</p>
                        <Button asChild variant="outline" className='mt-2'>
                           <label htmlFor="logo-upload" className='cursor-pointer'>
                             <Upload className="mr-2 h-4 w-4" />
                             Enviar Arquivo
                           </label>
                        </Button>
                        <Input id="logo-upload" type="file" className="sr-only" />
                    </div>
                </div>
                 <div className='pt-4 flex justify-end'>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                 </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
