
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';

export default function MinhaEmpresaPage() {
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
                  <Input id="razao-social" defaultValue="Exemplo Comércio de Software LTDA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                  <Input id="nome-fantasia" defaultValue="EscopoV3" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ie">Inscrição Estadual</Label>
                  <Input id="ie" defaultValue="123.456.789.112" />
                </div>
              </div>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" type="tel" defaultValue="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="contato@exemplo.com" />
                </div>
              </div>
              <div className='pt-4 flex justify-end'>
                <Button>Salvar Alterações</Button>
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
                  <Input id="cep" defaultValue="01001-000" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input id="logradouro" defaultValue="Praça da Sé" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" defaultValue="Lado par" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" defaultValue="Sé" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" defaultValue="São Paulo" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="uf">UF</Label>
                  <Input id="uf" defaultValue="SP" />
                </div>
              </div>
              <div className='pt-4 flex justify-end'>
                <Button>Salvar Alterações</Button>
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
                <Input id="class-tributaria" defaultValue="99 - Pessoas Jurídicas em Geral" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnae">CNAE Preponderante</Label>
                <Input id="cnae" defaultValue="6201-5/01 - Desenvolvimento de programas de computador sob encomenda" />
              </div>
              <div className='pt-4 flex justify-end'>
                <Button>Salvar Alterações</Button>
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
                        <AvatarImage src="https://picsum.photos/seed/logo/200" alt="Logo da Empresa"/>
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
                    <Button>Salvar Alterações</Button>
                 </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
