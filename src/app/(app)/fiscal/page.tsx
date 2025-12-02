'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PackagePlus, Wrench, Upload, FileMinus, Receipt, MoreHorizontal, Search, Filter, Plus, FileUp, Trash2, X, ArrowLeft, ArrowRight, Circle } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

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
    const [isLancamentoDialogOpen, setIsLancamentoDialogOpen] = useState(false);
    const [tipoNota, setTipoNota] = useState<'produto' | 'saida' | null>(null);

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

    const openLancamentoDialog = (tipo: 'produto' | 'saida') => {
        setTipoNota(tipo);
        setIsLancamentoDialogOpen(true);
    };
    
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Lançamentos Fiscais</h1>
          <p className="text-muted-foreground">
            Importe XMLs ou lance manually suas notas e recibos.
          </p>
        </div>

        <Dialog open={isLancamentoDialogOpen} onOpenChange={setIsLancamentoDialogOpen}>
            <Card>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-6">
                    {actions.map((action) => (
                        <ActionTile 
                            key={action.label} 
                            {...action} 
                            onFileChange={action.id === 'importar-xml' ? handleFileChange : undefined}
                            onActionClick={
                                action.id === 'nota-produto' ? () => openLancamentoDialog('produto') :
                                action.id === 'nota-saida' ? () => openLancamentoDialog('saida') :
                                undefined
                            }
                         />
                    ))}
                </CardContent>
            </Card>
            <LancamentoDialog onOpenChange={setIsLancamentoDialogOpen} tipoNota={tipoNota} />
        </Dialog>

        <Card>
            <Tabs defaultValue="xmls">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <TabsList className="grid w-full max-w-lg grid-cols-5">
                            <TabsTrigger value="xmls">XMLs Importados</TabsTrigger>
                            <TabsTrigger value="produtos">Notas de Produto</TabsTrigger>
                            <TabsTrigger value="saidas">Notas de Saída</TabsTrigger>
                            <TabsTrigger value="servicos">Notas de Serviço</TabsTrigger>
                            <TabsTrigger value="recibos">Recibos/Cupons</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow sm:flex-grow-0">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por arquivo..." className="pl-9 w-full" />
                            </div>
                            <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filtrar</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TabsContent value="xmls">
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
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhuma nota de produto encontrada.</p>
                        </div>
                    </TabsContent>
                     <TabsContent value="saidas">
                         <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhuma nota de saída encontrada.</p>
                        </div>
                    </TabsContent>
                     <TabsContent value="servicos">
                         <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhuma nota de serviço encontrada.</p>
                        </div>
                    </TabsContent>
                     <TabsContent value="recibos">
                         <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhum recibo encontrado.</p>
                        </div>
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
    onFileChange,
    onActionClick
}: { 
    id: string,
    icon: React.ReactNode, 
    label: string, 
    href?: string, 
    color: string,
    onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onActionClick?: () => void
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
    
    if (onActionClick) {
         return (
            <button onClick={onActionClick} className="w-full h-full text-left">
                {tileContent}
            </button>
        )
    }

    return (
        <Link href={href}>
           {tileContent}
        </Link>
    )
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
                                            <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-destructive focus:text-destructive">
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

interface ProductItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
}


function LancamentoDialog({ onOpenChange, tipoNota }: { onOpenChange: (open: boolean) => void, tipoNota: 'produto' | 'saida' | null }) {
    const { toast } = useToast();
    const [productItems, setProductItems] = useState<ProductItem[]>([]);
    const [activeSection, setActiveSection] = useState('geral');
    const [tipoNotaValue, setTipoNotaValue] = useState('');

    const notaLabel = tipoNota === 'produto' ? 'de Produto' : 'de Saída';

    useEffect(() => {
        if (tipoNota) {
            setTipoNotaValue(tipoNota === 'produto' ? 'entrada' : 'saida');
        }
    }, [tipoNota]);

    const sections = [
        { id: 'geral', label: 'Dados Gerais' },
        { id: 'emitente', label: 'Emitente / Dest.' },
        { id: 'produtos', label: 'Itens da Nota' },
        { id: 'tributos', label: 'Tributos' },
        { id: 'transporte', label: 'Transporte' },
        { id: 'faturas', label: 'Faturas' },
        { id: 'info', label: 'Informações Adicionais' },
    ];

    const handleAddProduct = () => {
        const newItem: ProductItem = {
            id: Date.now(),
            name: 'Novo Produto',
            quantity: 1,
            price: 0.0,
            total: 0.0,
        };
        setProductItems(prev => [...prev, newItem]);
    };

    const handleRemoveProduct = (id: number) => {
        setProductItems(prev => prev.filter(item => item.id !== id));
    };
    
    const handleProductChange = (id: number, field: keyof Omit<ProductItem, 'id' | 'total'>, value: string) => {
        setProductItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                const quantity = parseFloat(String(updatedItem.quantity));
                const price = parseFloat(String(updatedItem.price));
                if (!isNaN(quantity) && !isNaN(price)) {
                    updatedItem.total = quantity * price;
                }
                return updatedItem;
            }
            return item;
        }));
    };
    

    const handleSave = () => {
        console.log("Saving data...", { productItems });
    
        toast({
          title: "Nota Fiscal Lançada",
          description: "A nota fiscal foi salva com sucesso.",
        });
    
        onOpenChange(false);
    };

    const totalProdutos = productItems.reduce((acc, item) => acc + item.total, 0);
    const totalNota = totalProdutos; // This will be more complex later
  
    const renderSection = () => {
        switch (activeSection) {
            case 'geral':
                return (
                    <Card>
                        <CardHeader><CardTitle>Dados Gerais da Nota</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="nf-tipo">Tipo da Nota</Label>
                                    <Select value={tipoNotaValue} onValueChange={setTipoNotaValue} disabled>
                                        <SelectTrigger id="nf-tipo">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="entrada">Entrada</SelectItem>
                                            <SelectItem value="saida">Saída</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nf-finalidade">Finalidade</Label>
                                    <Select><SelectTrigger id="nf-finalidade"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="complementar">Complementar</SelectItem><SelectItem value="ajuste">Ajuste</SelectItem><SelectItem value="devolucao">Devolução</SelectItem></SelectContent></Select>
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="nf-natureza">Natureza da Operação (CFOP)</Label>
                                    <Input id="nf-natureza" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label htmlFor="nf-modelo">Modelo</Label><Input id="nf-modelo" /></div>
                                <div className="space-y-2"><Label htmlFor="nf-serie">Série</Label><Input id="nf-serie" /></div>
                                <div className="space-y-2"><Label htmlFor="nf-numero">Número</Label><Input id="nf-numero" /></div>
                                <div className="space-y-2"><Label htmlFor="nf-data-emissao">Data de Emissão</Label><Input id="nf-data-emissao" type="datetime-local" /></div>
                            </div >
                        </CardContent>
                    </Card>
                )
            case 'emitente':
                return (
                    <Card>
                        <CardHeader><CardTitle>Dados do Emitente / Destinatário</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label htmlFor="emit-cnpj">CNPJ / CPF</Label><Input id="emit-cnpj" /></div>
                                <div className="space-y-2 col-span-1 md:col-span-2"><Label htmlFor="emit-razao-social">Razão Social</Label><Input id="emit-razao-social" /></div>
                                <div className="space-y-2"><Label htmlFor="emit-ie">Inscrição Estadual</Label><Input id="emit-ie" /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label htmlFor="emit-cep">CEP</Label><Input id="emit-cep" /></div>
                                <div className="space-y-2 col-span-1 md:col-span-2"><Label htmlFor="emit-logradouro">Logradouro</Label><Input id="emit-logradouro" /></div>
                                <div className="space-y-2"><Label htmlFor="emit-numero">Número</Label><Input id="emit-numero" /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label htmlFor="emit-bairro">Bairro</Label><Input id="emit-bairro" /></div>
                                <div className="space-y-2"><Label htmlFor="emit-cidade">Cidade</Label><Input id="emit-cidade" /></div>
                                <div className="space-y-2"><Label htmlFor="emit-uf">UF</Label><Input id="emit-uf" /></div>
                                <div className="space-y-2">
                                    <Label htmlFor="emit-regime">Regime Tributário</Label>
                                    <Select><SelectTrigger id="emit-regime"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="simples">Simples Nacional</SelectItem><SelectItem value="presumido">Lucro Presumido</SelectItem><SelectItem value="real">Lucro Real</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            case 'produtos':
                return (
                    <Card>
                        <CardHeader><CardTitle>Itens da Nota</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow>
                                    <TableHead className="w-[40%]">Produto</TableHead>
                                    <TableHead>Qtd.</TableHead>
                                    <TableHead>Vl. Unit.</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                    {productItems.length > 0 ? productItems.map((item) => (
                                        <TableRow key={item.id} className="has-[:focus-visible]:bg-muted/40">
                                            <TableCell className="font-medium">
                                                <Input value={item.name} onChange={(e) => handleProductChange(item.id, 'name', e.target.value)} className="h-8" />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.quantity} onChange={(e) => handleProductChange(item.id, 'quantity', e.target.value)} className="h-8 w-20" />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.price} onChange={(e) => handleProductChange(item.id, 'price', e.target.value)} className="h-8 w-24" />
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{item.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</TableCell>
                                            <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveProduct(item.id)}><X className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum produto adicionado.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex justify-end"><Button variant="outline" onClick={handleAddProduct}><Plus className="mr-2 h-4 w-4" /> Adicionar Produto</Button></div>
                        </CardContent>
                    </Card>
                )
            case 'tributos':
                return (
                    <Card>
                        <CardHeader><CardTitle>Tributos da Nota</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2"><Label htmlFor="trib-bc-icms">Base ICMS</Label><Input id="trib-bc-icms" readOnly value="R$ 0,00" /></div>
                                <div className="space-y-2"><Label htmlFor="trib-valor-icms">Valor ICMS</Label><Input id="trib-valor-icms" readOnly value="R$ 0,00" /></div>
                                <div className="space-y-2"><Label htmlFor="trib-bc-st">Base ICMS ST</Label><Input id="trib-bc-st" readOnly value="R$ 0,00" /></div>
                                <div className="space-y-2"><Label htmlFor="trib-valor-st">Valor ICMS ST</Label><Input id="trib-valor-st" readOnly value="R$ 0,00" /></div>
                                <div className="space-y-2"><Label htmlFor="trib-valor-ipi">Valor IPI</Label><Input id="trib-valor-ipi" readOnly value="R$ 0,00" /></div>
                                <div className="space-y-2"><Label htmlFor="trib-valor-pis">Valor PIS</Label><Input id="trib-valor-pis" readOnly value="R$ 0,00" /></div>
                                <div className="space-y-2"><Label htmlFor="trib-valor-cofins">Valor COFINS</Label><Input id="trib-valor-cofins" readOnly value="R$ 0,00" /></div>
                                <div className="space-y-2"><Label htmlFor="trib-valor-total">Valor Total Tributos</Label><Input id="trib-valor-total" readOnly value="R$ 0,00" /></div>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'transporte':
                return (
                    <Card>
                        <CardHeader><CardTitle>Dados do Transporte</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="transp-modalidade">Modalidade do Frete</Label>
                                    <Select><SelectTrigger id="transp-modalidade"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>
                                        <SelectItem value="0">Contratação do Frete por conta do Remetente (CIF)</SelectItem>
                                        <SelectItem value="1">Contratação do Frete por conta do Destinatário (FOB)</SelectItem>
                                        <SelectItem value="2">Contratação do Frete por conta de Terceiros</SelectItem>
                                        <SelectItem value="3">Transporte Próprio por conta do Remetente</SelectItem>
                                        <SelectItem value="4">Transporte Próprio por conta do Destinatário</SelectItem>
                                        <SelectItem value="9">Sem Ocorrência de Transporte</SelectItem>
                                    </SelectContent></Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="transp-transportadora">Transportadora</Label>
                                    <Input id="transp-transportadora" placeholder="Razão Social da Transportadora"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label htmlFor="transp-cnpj">CNPJ</Label><Input id="transp-cnpj"/></div>
                                <div className="space-y-2"><Label htmlFor="transp-placa">Placa do Veículo</Label><Input id="transp-placa"/></div>
                                <div className="space-y-2"><Label htmlFor="transp-uf-veiculo">UF do Veículo</Label><Input id="transp-uf-veiculo"/></div>
                            </div>
                            <Separator className="my-4" />
                            <h4 className="text-md font-semibold">Volumes</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="space-y-2"><Label htmlFor="vol-qtd">Quantidade</Label><Input id="vol-qtd" type="number"/></div>
                                <div className="space-y-2"><Label htmlFor="vol-especie">Espécie</Label><Input id="vol-especie"/></div>
                                <div className="space-y-2"><Label htmlFor="vol-marca">Marca</Label><Input id="vol-marca"/></div>
                                <div className="space-y-2"><Label htmlFor="vol-peso-bruto">Peso Bruto</Label><Input id="vol-peso-bruto" type="number"/></div>
                                <div className="space-y-2"><Label htmlFor="vol-peso-liquido">Peso Líquido</Label><Input id="vol-peso-liquido" type="number"/></div>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'faturas':
                return (
                    <Card>
                        <CardHeader><CardTitle>Faturas e Pagamentos</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="fat-tipo-pag">Tipo de Pagamento</Label>
                                    <Select><SelectTrigger id="fat-tipo-pag"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="cartao">Cartão</SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                        <SelectItem value="pix">Pix</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent></Select>
                                </div>
                                <div className="space-y-2"><Label htmlFor="fat-valor">Valor</Label><Input id="fat-valor" type="number"/></div>
                                <div className="space-y-2"><Label htmlFor="fat-numero">Nº da Fatura</Label><Input id="fat-numero"/></div>
                                <div className="space-y-2"><Label htmlFor="fat-vencimento">Vencimento</Label><Input id="fat-vencimento" type="date"/></div>
                            </div>
                            <div className="text-center pt-4">
                                <p className="text-sm text-muted-foreground">Funcionalidade de parcelas em desenvolvimento.</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'info':
                 return (
                    <Card>
                        <CardHeader><CardTitle>Informações Adicionais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="info-complementares">Informações Complementares de Interesse do Contribuinte</Label>
                                <Textarea id="info-complementares" rows={4} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="info-fisco">Informações Adicionais de Interesse do Fisco</Label>
                                <Textarea id="info-fisco" rows={4} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="info-obs">Observações Internas</Label>
                                <Textarea id="info-obs" rows={2} />
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    }

    if (!tipoNota) return null;

    return (
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Lançamento de Nota Fiscal {notaLabel}</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para realizar o lançamento da nota fiscal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-[200px_1fr] gap-6 overflow-hidden">
            <aside className="border-r pr-4">
                <nav className="flex flex-col gap-1">
                    {sections.map(section => (
                        <Button
                            key={section.id}
                            variant={activeSection === section.id ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => setActiveSection(section.id)}
                        >
                            {section.label}
                        </Button>
                    ))}
                </nav>
            </aside>
            <main className="overflow-y-auto">
                {renderSection()}
            </main>
        </div>

        <DialogFooter className="border-t pt-4 mt-auto">
            <div className="flex w-full justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    <p>Total Produtos: <span className="font-bold text-foreground">{totalProdutos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                    <p>Total Nota: <span className="font-bold text-foreground text-lg">{totalNota.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                </div>
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Salvar Lançamento</Button>
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    );
}
