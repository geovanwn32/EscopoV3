'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PackagePlus, Wrench, Upload, FileMinus, Receipt, MoreHorizontal, Search, Filter, Plus, FileUp, Trash2, X, ArrowLeft, ArrowRight } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
                            onDelete={handleDeleteXml}
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
                             onDelete={handleDeleteXml}
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
                             onDelete={handleDeleteXml}
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
                             onDelete={handleDeleteXml}
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

const steps = [
    { id: '01', name: 'Dados Gerais', fields: ['nf-tipo', 'nf-finalidade', 'nf-natureza', 'nf-modelo', 'nf-serie', 'nf-numero', 'nf-data-emissao'] },
    { id: '02', name: 'Emitente / Dest.', fields: ['emit-cnpj', 'emit-razao-social', 'emit-ie', 'emit-cep', 'emit-logradouro', 'emit-numero', 'emit-bairro', 'emit-cidade', 'emit-uf', 'emit-regime'] },
    { id: '03', name: 'Itens da Nota', fields: [] },
    { id: '04', name: 'Tributos', fields: [] },
    { id: '05', name: 'Transporte', fields: [] },
    { id: '06', name: 'Faturas', fields: [] },
    { id: '07', name: 'Informações Adicionais', fields: [] },
]

function LancamentoProdutoDialog() {
    const [currentStep, setCurrentStep] = useState(0);
    const productItems: any[] = [];
    const totalNota = productItems.reduce((acc, item) => acc + (item.total || 0), 0);

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(step => step + 1);
        }
    }

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(step => step - 1);
        }
    }
  
    return (
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Lançamento de Nota Fiscal de Produto</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para realizar o lançamento da nota fiscal.
          </DialogDescription>
        </DialogHeader>

        <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                {steps.map((step, index) => (
                <li key={step.name} className="md:flex-1">
                    {index < currentStep ? (
                    <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                        <span className="text-sm font-medium text-primary transition-colors ">{step.id}</span>
                        <span className="text-sm font-medium">{step.name}</span>
                    </div>
                    ) : index === currentStep ? (
                    <div className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                        <span className="text-sm font-medium text-primary">{step.id}</span>
                        <span className="text-sm font-medium">{step.name}</span>
                    </div>
                    ) : (
                    <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                        <span className="text-sm font-medium text-gray-500 transition-colors">{step.id}</span>
                        <span className="text-sm font-medium">{step.name}</span>
                    </div>
                    )}
                </li>
                ))}
            </ol>
        </nav>


        <div className="py-4 max-h-[60vh] min-h-[40vh] overflow-y-auto pr-4">
            
            {currentStep === 0 && (
                <div className="space-y-4 rounded-md border p-4">
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
                            <Input id="nf-natureza" />
                        </div>
                    </FormRow>
                        <FormRow>
                        <div className="space-y-2">
                            <Label htmlFor="nf-modelo">Modelo</Label>
                            <Input id="nf-modelo" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nf-serie">Série</Label>
                            <Input id="nf-serie" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nf-numero">Número</Label>
                            <Input id="nf-numero" />
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor="nf-data-emissao">Data de Emissão</Label>
                            <Input id="nf-data-emissao" type="datetime-local" />
                        </div>
                    </FormRow>
                </div>
            )}
            {currentStep === 1 && (
                 <div className="space-y-4 rounded-md border p-4">
                    <FormRow>
                        <div className="space-y-2">
                            <Label htmlFor="emit-cnpj">CNPJ / CPF</Label>
                            <Input id="emit-cnpj" />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label htmlFor="emit-razao-social">Razão Social</Label>
                            <Input id="emit-razao-social" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emit-ie">Inscrição Estadual</Label>
                            <Input id="emit-ie" />
                        </div>
                    </FormRow>
                        <FormRow>
                        <div className="space-y-2">
                            <Label htmlFor="emit-cep">CEP</Label>
                            <Input id="emit-cep" />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label htmlFor="emit-logradouro">Logradouro</Label>
                            <Input id="emit-logradouro" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emit-numero">Número</Label>
                            <Input id="emit-numero" />
                        </div>
                    </FormRow>
                        <FormRow>
                            <div className="space-y-2">
                            <Label htmlFor="emit-bairro">Bairro</Label>
                            <Input id="emit-bairro" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emit-cidade">Cidade</Label>
                            <Input id="emit-cidade" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emit-uf">UF</Label>
                            <Input id="emit-uf" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emit-regime">Regime Tributário</Label>
                            <Select>
                                <SelectTrigger id="emit-regime"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="simples">Simples Nacional</SelectItem>
                                    <SelectItem value="presumido">Lucro Presumido</SelectItem>
                                    <SelectItem value="real">Lucro Real</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        </FormRow>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-4 rounded-md border p-4">
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
                        {productItems.length > 0 ? productItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{Number(item.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</TableCell>
                                <TableCell className="text-right">{item.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Nenhum produto adicionado.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Adicionar Produto</Button>
                    </div>
                </div>
            )}
            
            {[3, 4, 5, 6].includes(currentStep) && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Seção em desenvolvimento.</p>
                </div>
            )}

        </div>
        <DialogFooter>
            <div className="flex w-full justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    <p>Total Produtos: <span className="font-bold text-foreground">{totalNota.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                    <p>Total Nota: <span className="font-bold text-foreground text-lg">{totalNota.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={prev} disabled={currentStep === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Voltar
                    </Button>

                    {currentStep < steps.length - 1 && (
                        <Button onClick={next}>
                            Avançar
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                         <Button type="submit">Salvar Lançamento</Button>
                    )}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    );
  }
    
    






    

    