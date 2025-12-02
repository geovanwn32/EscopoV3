
'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Upload, Building2 } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    regimeTributario: '',
    cnae: '',
    logo: '',
  });
  
  const [isQueryingCnpj, setIsQueryingCnpj] = useState(false);

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
          regimeTributario: activeCompany.data?.regimeTributario || '',
          cnae: activeCompany.data?.cnae || '',
          logo: activeCompany.data?.logo || '',
        });
      }
    } else if (companies.length > 0) {
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

  const handleCnpjQuery = () => {
    if (!companyData.cnpj) {
        toast({ variant: 'destructive', title: 'CNPJ inválido', description: 'Por favor, insira um CNPJ para consultar.' });
        return;
    }
    setIsQueryingCnpj(true);
    // Simulate API call
    setTimeout(() => {
        const mockData = {
            razaoSocial: 'EMPRESA CONSULTADA LTDA',
            nomeFantasia: 'NOME FANTASIA API',
            cep: '74000-000',
            logradouro: 'Avenida Exemplo',
            numero: '123',
            bairro: 'Centro',
            cidade: 'Goiânia',
            uf: 'GO',
            telefone: '62999998888',
            email: 'contato@api.com',
            cnae: '6201501',
            regimeTributario: 'simples'
        };

        setCompanyData(prev => ({
            ...prev,
            ...mockData,
        }));

        setIsQueryingCnpj(false);
        toast({ title: 'CNPJ Consultado!', description: 'Os dados da empresa foram preenchidos.' });
    }, 1500);
  }
  
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

        <Tabs defaultValue="geral">
            <TabsList>
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
            </TabsList>

            <TabsContent value="geral">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Gerais</CardTitle>
                        <CardDescription>Informações principais de identificação da sua empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <div className="flex gap-2">
                                <Input id="cnpj" value={companyData.cnpj} onChange={(e) => handleInputChange('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
                                <Button variant="outline" onClick={handleCnpjQuery} disabled={isQueryingCnpj}>
                                    {isQueryingCnpj ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                                    <span className="ml-2 hidden sm:inline">Consultar</span>
                                </Button>
                            </div>
                        </div>
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
                                <Label htmlFor="ie">Inscrição Estadual</Label>
                                <Input id="ie" value={companyData.ie} onChange={(e) => handleInputChange('ie', e.target.value)} placeholder="Inscrição Estadual" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input id="telefone" value={companyData.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} placeholder="(00) 00000-0000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={companyData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="contato@suaempresa.com" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="endereco">
                <Card>
                    <CardHeader>
                        <CardTitle>Endereço</CardTitle>
                        <CardDescription>Endereço da sede principal da empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2 sm:col-span-1">
                                <Label htmlFor="cep">CEP</Label>
                                <Input id="cep" value={companyData.cep} onChange={(e) => handleInputChange('cep', e.target.value)} placeholder="74000-000" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="logradouro">Logradouro</Label>
                                <Input id="logradouro" value={companyData.logradouro} onChange={(e) => handleInputChange('logradouro', e.target.value)} placeholder="Avenida, Rua, etc." />
                            </div>
                             <div className="space-y-2 sm:col-span-1">
                                <Label htmlFor="numero">Número</Label>
                                <Input id="numero" value={companyData.numero} onChange={(e) => handleInputChange('numero', e.target.value)} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="complemento">Complemento</Label>
                                <Input id="complemento" value={companyData.complemento} onChange={(e) => handleInputChange('complemento', e.target.value)} placeholder="Sala, Bloco, etc." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input id="bairro" value={companyData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" value={companyData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)} />
                            </div>
                             <div className="space-y-2 sm:col-span-1">
                                <Label htmlFor="uf">UF</Label>
                                <Input id="uf" value={companyData.uf} onChange={(e) => handleInputChange('uf', e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="fiscal">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Fiscais</CardTitle>
                        <CardDescription>Configurações tributárias e fiscais da empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="regimeTributario">Regime Tributário</Label>
                                 <Select value={companyData.regimeTributario} onValueChange={(value) => handleInputChange('regimeTributario', value)}>
                                    <SelectTrigger id="regimeTributario">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="simples">Simples Nacional</SelectItem>
                                        <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                                        <SelectItem value="lucro_real">Lucro Real</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cnae">CNAE Principal</Label>
                                <Input id="cnae" value={companyData.cnae} onChange={(e) => handleInputChange('cnae', e.target.value)} placeholder="Código CNAE" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="logo">
                <Card>
                    <CardHeader>
                        <CardTitle>Logo da Empresa</CardTitle>
                        <CardDescription>Faça o upload do logotipo que representará a empresa no sistema.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <Avatar className="h-32 w-32 rounded-lg border-2">
                            <AvatarImage src={companyData.logo || undefined} alt="Logo da Empresa" />
                            <AvatarFallback className="rounded-lg">
                                <Building2 className="h-16 w-16 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <Button asChild variant="outline">
                            <label htmlFor="logo-upload" className='cursor-pointer'>
                                <Upload className="mr-2 h-4 w-4" /> Enviar Logo
                                <input id="logo-upload" type="file" className="sr-only" accept="image/*" />
                            </label>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        <div className='pt-6 flex justify-end'>
            <Button onClick={handleSave} size="lg">Salvar Alterações</Button>
        </div>
    </div>
  );
}

    