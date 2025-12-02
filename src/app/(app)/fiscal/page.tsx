'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PackagePlus, Wrench, Upload, FileMinus, Receipt, MoreHorizontal, Search, Filter, Plus, FileUp, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const actions = [
    {
        id: "importar-xml",
        icon: <Upload className="h-8 w-8" />,
        label: "Importar XML",
        href: "#",
        color: "text-sky-600 bg-sky-100/80 group-hover:bg-sky-600 dark:bg-sky-900/40 dark:text-sky-400 dark:group-hover:bg-sky-500",
    },
    {
        id: "nota-produto",
        icon: <PackagePlus className="h-8 w-8" />,
        label: "Nota Produto",
        href: "#",
        color: "text-emerald-600 bg-emerald-100/80 group-hover:bg-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-500",
    },
    {
        id: "nota-saida",
        icon: <FileMinus className="h-8 w-8" />,
        label: "Nota Saída",
        href: "#",
        color: "text-amber-600 bg-amber-100/80 group-hover:bg-amber-600 dark:bg-amber-900/40 dark:text-amber-400 dark:group-hover:bg-amber-500",
    },
    {
        id: "nota-servico",
        icon: <Wrench className="h-8 w-8" />,
        label: "Nota Serviço",
        href: "#",
        color: "text-indigo-600 bg-indigo-100/80 group-hover:bg-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 dark:group-hover:bg-indigo-500",
    },
    {
        id: "recibos",
        icon: <Receipt className="h-8 w-8" />,
        label: "Recibos/Cupons",
        href: "#",
        color: "text-slate-600 bg-slate-100/80 group-hover:bg-slate-600 dark:bg-slate-700/40 dark:text-slate-400 dark:group-hover:bg-slate-500",
    },
]

interface XmlFile {
    id: number;
    file: string;
    date: string;
    status: 'Importado' | 'Lançado' | 'Erro';
}

const mockNotasProduto: any[] = [];
const mockNotasSaida: any[] = [];
const mockNotasServico: any[] = [];
const mockRecibos: any[] = [];


export default function FiscalPage() {
    const { toast } = useToast();
    const [xmls, setXmls] = useState<XmlFile[]>([]);
    const [isNotaProdutoDialogOpen, setIsNotaProdutoDialogOpen] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            
            const newFiles: XmlFile[] = Array.from(files).map((file, index) => ({
                id: Date.now() + index,
                file: file.name,
                date: new Date().toLocaleDateString('pt-BR'),
                status: 'Importado'
            }));

            setXmls(prevXmls => [...prevXmls, ...newFiles]);

            toast({
                title: "Arquivos Importados com Sucesso",
                description: `${fileNames}`,
            });
            event.target.value = '';
        }
    };

    const handleLancarXml = (id: number) => {
        setXmls(prevXmls => 
            prevXmls.map(xml => 
                xml.id === id ? { ...xml, status: 'Lançado' } : xml
            )
        );
        toast({
            title: 'Arquivo Lançado!',
            description: `O documento foi lançado com sucesso no sistema.`
        });
    };

    const handleDeleteXml = (id: number) => {
        setXmls(prevXmls => prevXmls.filter(xml => xml.id !== id));
        toast({
            variant: "destructive",
            title: 'Arquivo Excluído!',
            description: `O documento foi removido da lista.`
        });
    }
    
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Lançamentos Fiscais</h1>
          <p className="text-muted-foreground">
            Importe XMLs ou lance manually suas notas e recibos.
          </p>
        </div>

        <Dialog open={isNotaProdutoDialogOpen} onOpenChange={setIsNotaProdutoDialogOpen}>
            <Card>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-6">
                    {actions.map((action) => (
                        <ActionTile key={action.label} {...action} onFileChange={action.id === 'importar-xml' ? handleFileChange : undefined} />
                    ))}
                </CardContent>
            </Card>
            <LancamentoProdutoDialog />
        </Dialog>

        <Card>
            <Tabs defaultValue="xmls">
                <CardHeader>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="xmls">XMLs Importados</TabsTrigger>
                        <TabsTrigger value="produtos">Notas de Produto</TabsTrigger>
                        <TabsTrigger value="saidas">Notas de Saída</TabsTrigger>
                        <TabsTrigger value="servicos">Notas de Serviço</TabsTrigger>
                        <TabsTrigger value="recibos">Recibos/Cupons</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TabsContent value="xmls">
                        <ListHeader 
                            title="XMLs Importados"
                            description="Documentos fiscais importados recentemente."
                            searchPlaceholder="Buscar por arquivo..."
                        />
                        <RecentDocumentsTable
                            headers={['Arquivo', 'Data Importação', 'Status']}
                            data={xmls}
                            renderRow={(item: XmlFile) => (
                                <>
                                    <TableCell className="font-medium">{item.file}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            item.status === 'Lançado' ? 'default' :
                                            item.status === 'Importado' ? 'secondary' : 'destructive'
                                        }>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                </>
                            )}
                            onLancar={handleLancarXml}
                            onDelete={handleDeleteXml}
                        />
                    </TabsContent>
                     <TabsContent value="produtos">
                        <ListHeader 
                            title="Notas de Produto"
                            description="Notas fiscais de produto emitidas recentemente."
                            searchPlaceholder="Buscar por cliente ou nº..."
                            buttonLabel="Nova Nota"
                            buttonIcon={<Plus className="mr-2 h-4 w-4"/>}
                        />
                        <RecentDocumentsTable
                            headers={['Número', 'Cliente', 'Valor', 'Status']}
                            data={mockNotasProduto}
                            renderRow={(item: any) => (
                                <>
                                    <TableCell className="font-medium">{item.number}</TableCell>
                                    <TableCell>{item.client}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell><Badge>{item.status}</Badge></TableCell>
                                </>
                            )}
                        />
                    </TabsContent>
                     <TabsContent value="saidas">
                        <ListHeader 
                            title="Notas de Saída"
                            description="Notas fiscais de saída emitidas recentemente."
                            searchPlaceholder="Buscar por destinatário..."
                            buttonLabel="Nova Nota"
                            buttonIcon={<Plus className="mr-2 h-4 w-4"/>}
                        />
                        <RecentDocumentsTable
                            headers={['Número', 'Destinatário', 'Valor', 'Status']}
                            data={mockNotasSaida}
                            renderRow={(item: any) => (
                                <>
                                    <TableCell className="font-medium">{item.number}</TableCell>
                                    <TableCell>{item.client}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell><Badge variant="destructive">{item.status}</Badge></TableCell>
                                </>
                            )}
                        />
                    </TabsContent>
                     <TabsContent value="servicos">
                        <ListHeader 
                            title="Notas de Serviço"
                            description="Notas fiscais de serviço emitidas recentemente."
                            searchPlaceholder="Buscar por tomador..."
                            buttonLabel="Nova Nota"
                            buttonIcon={<Plus className="mr-2 h-4 w-4"/>}
                        />
                        <RecentDocumentsTable
                            headers={['Número', 'Tomador', 'Valor', 'Status']}
                            data={mockNotasServico}
                            renderRow={(item: any) => (
                                <>
                                    <TableCell className="font-medium">{item.number}</TableCell>
                                    <TableCell>{item.client}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell><Badge>{item.status}</Badge></TableCell>
                                </>
                            )}
                        />
                    </TabsContent>
                     <TabsContent value="recibos">
                        <ListHeader 
                            title="Recibos/Cupons"
                            description="Recibos e cupons fiscais emitidos recentemente."
                            searchPlaceholder="Buscar por cliente..."
                            buttonLabel="Novo Recibo"
                            buttonIcon={<Plus className="mr-2 h-4 w-4"/>}
                        />
                        <RecentDocumentsTable
                            headers={['Número', 'Cliente', 'Valor', 'Status']}
                            data={mockRecibos}
                            renderRow={(item: any) => (
                                <>
                                    <TableCell className="font-medium">{item.number}</TableCell>
                                    <TableCell>{item.client}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                                </>
                            )}
                        />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
      </div>
    );
}

function ActionTile({ 
    id,
    icon, 
    label, 
    href = "#", 
    color,
    onFileChange
}: { 
    id: string,
    icon: React.ReactNode, 
    label: string, 
    href?: string, 
    color: string,
    onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
    const tileContent = (
        <div className="group flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className={cn(
                "rounded-full p-3 transition-colors group-hover:text-primary-foreground",
                color
            )}>
                {icon}
            </div>
            <span className="text-center text-sm font-semibold">{label}</span>
        </div>
    );

    if (id === 'importar-xml' && onFileChange) {
        const inputId = "xml-upload";
        return (
            <div>
                <label htmlFor={inputId} className="cursor-pointer">
                    {tileContent}
                </label>
                <Input 
                    id={inputId} 
                    type="file" 
                    className="sr-only" 
                    accept=".xml" 
                    multiple 
                    onChange={onFileChange}
                />
            </div>
        );
    }

    if (id === 'nota-produto') {
        return (
            <DialogTrigger asChild>
                {tileContent}
            </DialogTrigger>
        )
    }

    return (
        <Link href={href}>
           {tileContent}
        </Link>
    )
}

function ListHeader({ title, description, searchPlaceholder, buttonLabel, buttonIcon }: { title: string, description: string, searchPlaceholder: string, buttonLabel?: string, buttonIcon?: React.ReactNode}) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="space-y-1.5 flex-grow">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={searchPlaceholder} className="pl-9 w-full" />
                </div>
                <Button variant="outline" className="hidden sm:inline-flex"><Filter className="mr-2 h-4 w-4"/>Filtrar</Button>
                {buttonLabel && buttonIcon && (
                     <DialogTrigger asChild>
                        <Button className="flex-grow sm:flex-grow-0">{buttonIcon}{buttonLabel}</Button>
                     </DialogTrigger>
                )}
            </div>
        </div>
    );
}


function RecentDocumentsTable({ 
    headers, 
    data, 
    renderRow,
    onLancar,
    onDelete
}: { 
    headers: string[], 
    data: any[], 
    renderRow: (item: any) => React.ReactNode,
    onLancar?: (id: number) => void,
    onDelete?: (id: number) => void
}) {
    const { toast } = useToast();
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);

    const handleDeleteClick = (item: any) => {
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete && onDelete) {
            onDelete(itemToDelete.id);
        }
        setItemToDelete(null);
    };

    return (
        <>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                            <TableHead className="w-[64px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? data.map((item) => (
                            <TableRow key={item.id}>
                               {renderRow(item)}
                               <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Ações</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {onLancar && (item as XmlFile).status === 'Importado' && (
                                            <DropdownMenuItem onClick={() => onLancar(item.id)}>
                                                <FileUp className="mr-2 h-4 w-4" />
                                                Lançar
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => toast({ title: 'Ação: Visualizar', description: `Visualizando item ${item.id}` })}>Visualizar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toast({ title: 'Ação: Editar', description: `Editando item ${item.id}` })}>Editar</DropdownMenuItem>
                                        {onDelete && (
                                            <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                               </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                                    Nenhum documento encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
             <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o documento
                             <span className="font-bold"> "{itemToDelete?.file}"</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b">{children}</h3>
    )
}

function FormRow({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            {children}
        </div>
    )
}

function LancamentoProdutoDialog() {
    // Mock data, in a real scenario this would come from an API or the XML file
    const productItems = [
        { id: 1, name: 'AMEND CROC CEB SAL 20X40G', quantity: 20, price: '12.60', total: 252.00 },
        { id: 2, name: 'AMEND CROC TRADIC 20X40G', quantity: 5, price: '11.86', total: 59.30 },
        { id: 3, name: 'AMENDOIM JAP 20X40G', quantity: 20, price: '13.13', total: 262.60 },
    ];

    const totalNota = productItems.reduce((acc, item) => acc + item.total, 0);
  
    return (
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Lançamento de Nota Fiscal de Produto</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para realizar o lançamento da nota fiscal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Tabs defaultValue="geral">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="geral">Geral</TabsTrigger>
                    <TabsTrigger value="emitente-destinatario">Emitente/Dest.</TabsTrigger>
                    <TabsTrigger value="produtos">Produtos</TabsTrigger>
                    <TabsTrigger value="tributacao">Tributação</TabsTrigger>
                    <TabsTrigger value="transporte">Transporte</TabsTrigger>
                    <TabsTrigger value="faturas">Faturas</TabsTrigger>
                    <TabsTrigger value="adicionais">Info. Adicionais</TabsTrigger>
                </TabsList>

                {/* 1. Dados Gerais */}
                <TabsContent value="geral" className="mt-4 space-y-6">
                   <Card>
                       <CardHeader>
                           <CardTitle>Dados Gerais da Nota</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                            <FormRow>
                                <div className="space-y-2">
                                    <Label htmlFor="nf-tipo">Tipo da Nota</Label>
                                    <Select>
                                        <SelectTrigger id="nf-tipo"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nf-finalidade">Finalidade</Label>
                                     <Select>
                                        <SelectTrigger id="nf-finalidade"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="complementar">Complementar</SelectItem>
                                            <SelectItem value="ajuste">Ajuste</SelectItem>
                                            <SelectItem value="devolucao">Devolução</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="nf-natureza">Natureza da Operação (CFOP)</Label>
                                    <Input id="nf-natureza" defaultValue="Venda de mercadoria" />
                                </div>
                            </FormRow>
                             <FormRow>
                                <div className="space-y-2">
                                    <Label htmlFor="nf-modelo">Modelo</Label>
                                    <Input id="nf-modelo" defaultValue="55" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nf-serie">Série</Label>
                                    <Input id="nf-serie" defaultValue="1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nf-numero">Número</Label>
                                    <Input id="nf-numero" defaultValue="12345" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="nf-data-emissao">Data de Emissão</Label>
                                    <Input id="nf-data-emissao" type="datetime-local" defaultValue="2025-11-06T22:05" />
                                </div>
                            </FormRow>
                       </CardContent>
                   </Card>
                </TabsContent>

                {/* 2. Emitente / Destinatário */}
                <TabsContent value="emitente-destinatario" className="mt-4">
                     <Card>
                        <CardHeader>
                           <CardTitle>Dados do Emitente / Destinatário</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormRow>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-cnpj">CNPJ / CPF</Label>
                                    <Input id="emit-cnpj" defaultValue="11.786.827/0001-99" />
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="emit-razao-social">Razão Social</Label>
                                    <Input id="emit-razao-social" defaultValue="SIVALDO PEREIRA LEITE 39443817187" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-ie">Inscrição Estadual</Label>
                                    <Input id="emit-ie" defaultValue="104679387" />
                                </div>
                            </FormRow>
                             <FormRow>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-cep">CEP</Label>
                                    <Input id="emit-cep" defaultValue="74988-805" />
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="emit-logradouro">Logradouro</Label>
                                    <Input id="emit-logradouro" defaultValue="RUA DOUTOR COUTO" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-numero">Número</Label>
                                    <Input id="emit-numero" defaultValue="SN" />
                                </div>
                            </FormRow>
                             <FormRow>
                                 <div className="space-y-2">
                                    <Label htmlFor="emit-bairro">Bairro</Label>
                                    <Input id="emit-bairro" defaultValue="REAL GRANDEZA - 2A ETAPA" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-cidade">Cidade</Label>
                                    <Input id="emit-cidade" defaultValue="APARECIDA DE GOIANIA" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-uf">UF</Label>
                                    <Input id="emit-uf" defaultValue="GO" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-regime">Regime Tributário</Label>
                                    <Select>
                                        <SelectTrigger id="emit-regime"><SelectValue placeholder="Simples Nacional" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="simples">Simples Nacional</SelectItem>
                                            <SelectItem value="presumido">Lucro Presumido</SelectItem>
                                            <SelectItem value="real">Lucro Real</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                             </FormRow>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. Produtos */}
                <TabsContent value="produtos" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Itens da Nota</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Produto</TableHead>
                                    <TableHead>Qtd.</TableHead>
                                    <TableHead>Vl. Unit.</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {productItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{Number(item.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</TableCell>
                                        <TableCell className="text-right">{item.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex justify-end">
                                <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Adicionar Produto</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* 4. Tributação */}
                 <TabsContent value="tributacao" className="mt-4">
                     <Card>
                        <CardHeader>
                           <CardTitle>Totais de Tributos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormRow>
                                <div className="space-y-2">
                                    <Label>Base de Cálculo ICMS</Label>
                                    <Input readOnly disabled defaultValue="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor do ICMS</Label>
                                    <Input readOnly disabled defaultValue="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Base de Cálculo ICMS ST</Label>
                                    <Input readOnly disabled defaultValue="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor do ICMS ST</Label>
                                    <Input readOnly disabled defaultValue="R$ 0,00" />
                                </div>
                            </FormRow>
                             <FormRow>
                                <div className="space-y-2">
                                    <Label>Valor do IPI</Label>
                                    <Input readOnly disabled defaultValue="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor do PIS</Label>
                                    <Input readOnly disabled defaultValue="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor do COFINS</Label>
                                    <Input readOnly disabled defaultValue="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-destructive">Valor Total dos Tributos</Label>
                                    <Input readOnly disabled className="text-destructive font-bold" defaultValue="R$ 4.828,43" />
                                </div>
                            </FormRow>
                        </CardContent>
                    </Card>
                </TabsContent>

                 {/* 5. Transporte */}
                <TabsContent value="transporte" className="mt-4">
                     <Card>
                        <CardHeader>
                           <CardTitle>Dados de Transporte</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormRow>
                                <div className="space-y-2">
                                    <Label htmlFor="transp-modalidade">Modalidade do Frete</Label>
                                    <Select>
                                        <SelectTrigger id="transp-modalidade"><SelectValue placeholder="Sem Frete" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="9">Sem Ocorrência de Transporte</SelectItem>
                                            <SelectItem value="0">Contratação por conta do Remetente (CIF)</SelectItem>
                                            <SelectItem value="1">Contratação por conta do Destinatário (FOB)</SelectItem>
                                            <SelectItem value="2">Contratação por conta de Terceiros</SelectItem>
                                            <SelectItem value="3">Transporte Próprio por conta do Remetente</SelectItem>
                                            <SelectItem value="4">Transporte Próprio por conta do Destinatário</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </FormRow>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* 6. Faturas */}
                <TabsContent value="faturas" className="mt-4">
                     <Card>
                        <CardHeader>
                           <CardTitle>Faturas e Pagamentos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-sm text-muted-foreground">Nenhuma informação de pagamento encontrada no XML.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 {/* 7. Informações Adicionais */}
                <TabsContent value="adicionais" className="mt-4">
                     <Card>
                        <CardHeader>
                           <CardTitle>Informações Adicionais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Informações Complementares</Label>
                                <p className="text-sm p-3 bg-muted rounded-md">--NOTA FISCAL EMITIDA EM DECORRENCIA DE BAIXA DE ESTOQUE DECORRENTE DO ENCERRAMENTO DAS ATIVIDADES DA EMPRESA...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
        <DialogFooter>
            <div className="flex w-full justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    <p>Total Produtos: <span className="font-bold text-foreground">{totalNota.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                    <p>Total Nota: <span className="font-bold text-foreground text-lg">{totalNota.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                </div>
                <div>
                    <Button variant="outline">Cancelar</Button>
                    <Button type="submit" className="ml-2">Salvar Lançamento</Button>
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    );
  }
    
    


