'use client';

import { useState, useEffect, ChangeEvent } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
    file: File;
    date: string;
    status: 'Importado' | 'Lançado' | 'Erro';
    model?: 'produto' | 'saida' | 'servico';
}

export default function FiscalPage() {
    const { toast } = useToast();
    const [xmls, setXmls] = useState<XmlFile[]>([]);
    const [isLancamentoDialogOpen, setIsLancamentoDialogOpen] = useState(false);
    const [tipoNota, setTipoNota] = useState<'produto' | 'saida' | 'servico' | null>(null);
    const [lancamentoData, setLancamentoData] = useState<any>(null);
    
    const [notasProduto, setNotasProduto] = useState<any[]>([]);
    const [notasSaida, setNotasSaida] = useState<any[]>([]);
    const [notasServico, setNotasServico] = useState<any[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            
            const newFiles: XmlFile[] = Array.from(files).map((file, index) => {
                return {
                    id: Date.now() + index,
                    file: file,
                    date: new Date().toLocaleDateString('pt-BR'),
                    status: 'Importado',
                }
            });

            setXmls(prevXmls => [...prevXmls, ...newFiles]);

            toast({
                title: "Arquivos Importados com Sucesso",
                description: `${fileNames}`,
            });
            event.target.value = '';
        }
    };
    
    const handleLancarXml = (id: number) => {
        const xmlFile = xmls.find(x => x.id === id);
        if (!xmlFile) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            let detectedModel: 'produto' | 'servico' | null = null;
            let parsedData = {};

            // Simulating XML parsing
            if (content.includes('<infNFe') && content.includes('<NFe')) {
                detectedModel = 'produto';
                const products = Array.from(content.matchAll(/<det nItem="(\d+)">([\s\S]*?)<\/det>/g)).map(match => {
                    const itemContent = match[2];
                    const find = (tag: string) => itemContent.match(new RegExp(`<${tag}>(.*?)</${tag}>`))?.[1] || '';
                    return {
                        id: Date.now() + Math.random(),
                        name: find('xProd'),
                        quantity: parseFloat(find('qCom') || '0'),
                        price: parseFloat(find('vUnCom') || '0'),
                        total: parseFloat(find('vProd') || '0'),
                    };
                });
                parsedData = {
                    geral: {
                        numero: content.match(/<nNF>(.*?)<\/nNF>/)?.[1],
                        serie: content.match(/<serie>(.*?)<\/serie>/)?.[1],
                        dataEmissao: content.match(/<dhEmi>(.*?)<\/dhEmi>/)?.[1].substring(0, 16),
                    },
                    emitente: {
                        cnpj: content.match(/<emit>[\s\S]*?<CNPJ>(.*?)<\/CNPJ>/)?.[1],
                        razaoSocial: content.match(/<emit>[\s\S]*?<xNome>(.*?)<\/xNome>/)?.[1],
                    },
                    items: products,
                };
            } else if (content.includes('<infNFSe') || content.includes('<CompNfse')) {
                detectedModel = 'servico';
                 parsedData = {
                    identificacao: {
                        numero: content.match(/<Numero>(.*?)<\/Numero>/)?.[1],
                        dataEmissao: content.match(/<DataEmissao>(.*?)<\/DataEmissao>/)?.[1]?.substring(0, 16) || content.match(/<dhEmi>(.*?)<\/dhEmi>/)?.[1]?.substring(0, 16),
                    },
                    prestador: {
                        cnpj: content.match(/<Prestador>[\s\S]*?<Cnpj>(.*?)<\/Cnpj>/)?.[1] || content.match(/<PrestadorServico>[\s\S]*?<Cnpj>(.*?)<\/Cnpj>/)?.[1] || content.match(/<emit>[\s\S]*?<CNPJ>(.*?)<\/CNPJ>/)?.[1],
                        razaoSocial: content.match(/<PrestadorServico>[\s\S]*?<RazaoSocial>(.*?)<\/RazaoSocial>/)?.[1] || content.match(/<emit>[\s\S]*?<xNome>(.*?)<\/xNome>/)?.[1],
                    },
                    tomador: {
                        cnpj: content.match(/<TomadorServico>[\s\S]*?<Cnpj>(.*?)<\/Cnpj>/)?.[1] || content.match(/<toma>[\s\S]*?<CNPJ>(.*?)<\/CNPJ>/)?.[1],
                        razaoSocial: content.match(/<TomadorServico>[\s\S]*?<RazaoSocial>(.*?)<\/RazaoSocial>/)?.[1] || content.match(/<toma>[\s\S]*?<xNome>(.*?)<\/xNome>/)?.[1],
                    },
                    servico: {
                        valor: parseFloat(content.match(/<ValorServicos>(.*?)<\/ValorServicos>/)?.[1] || content.match(/<vServ>(.*?)<\/vServ>/)?.[1] || '0'),
                        descricao: content.match(/<Discriminacao>(.*?)<\/Discriminacao>/)?.[1] || content.match(/<xDescServ>(.*?)<\/xDescServ>/)?.[1],
                    }
                 };
            }
    
            if (detectedModel) {
                openLancamentoDialog(detectedModel, parsedData);
                setXmls(prevXmls => prevXmls.map(x => x.id === id ? { ...x, status: 'Lançado' } : x));
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Modelo de XML não suportado',
                    description: 'Não foi possível identificar o tipo de nota fiscal para este arquivo.'
                });
                 setXmls(prevXmls => prevXmls.map(x => x.id === id ? { ...x, status: 'Erro' } : x));
            }
        };
        reader.onerror = () => {
            toast({
                variant: 'destructive',
                title: 'Erro ao ler arquivo',
                description: 'Não foi possível ler o conteúdo do arquivo XML.'
            });
             setXmls(prevXmls => prevXmls.map(x => x.id === id ? { ...x, status: 'Erro' } : x));
        };
        reader.readAsText(xmlFile.file);
    };

    const handleDeleteXml = (id: number) => {
        setXmls(prevXmls => prevXmls.filter(xml => xml.id !== id));
        toast({
            variant: "destructive",
            title: 'Arquivo Excluído!',
            description: `O documento foi removido da lista.`
        });
    }

    const openLancamentoDialog = (tipo: 'produto' | 'saida' | 'servico', data: any = null) => {
        setTipoNota(tipo);
        setLancamentoData(data);
        setIsLancamentoDialogOpen(true);
    };

    const handleSaveNota = (savedNota: any) => {
        const notaComId = {...savedNota, id: Date.now()};
        if (savedNota.tipo === 'produto' || savedNota.tipo === 'entrada') {
            setNotasProduto(prev => [...prev, notaComId]);
        } else if (savedNota.tipo === 'saida') {
            setNotasSaida(prev => [...prev, notaComId]);
        } else if (savedNota.tipo === 'servico') {
            setNotasServico(prev => [...prev, notaComId]);
        }
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
                                action.id === 'nota-servico' ? () => openLancamentoDialog('servico') :
                                undefined
                            }
                         />
                    ))}
                </CardContent>
            </Card>
            <LancamentoDialog onOpenChange={setIsLancamentoDialogOpen} tipoNota={tipoNota} initialData={lancamentoData} onSave={handleSaveNota} />
        </Dialog>

        <Card>
            <Tabs defaultValue="xmls">
                <CardHeader>
                    <CardTitle>Documentos Fiscais</CardTitle>
                    <CardDescription>
                        Gerencie todos os seus documentos importados e lançados.
                    </CardDescription>
                     <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mt-4">
                        <TabsTrigger value="xmls">XMLs Importados</TabsTrigger>
                        <TabsTrigger value="produtos">Notas de Produto</TabsTrigger>
                        <TabsTrigger value="saidas">Notas de Saída</TabsTrigger>
                        <TabsTrigger value="servicos">Notas de Serviço</TabsTrigger>
                        <TabsTrigger value="recibos">Recibos/Cupons</TabsTrigger>
                    </TabsList>
                    <div className="flex w-full items-center gap-2 pt-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar em todos os documentos..." className="pl-9 w-full" />
                        </div>
                        <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filtrar</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TabsContent value="xmls">
                        <RecentDocumentsTable
                            headers={['Arquivo', 'Data Importação', 'Status']}
                            data={xmls}
                            renderRow={(item: XmlFile) => (
                                <>
                                    <TableCell className="font-medium">{item.file.name}</TableCell>
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
                        <NotasFiscaisTable data={notasProduto} tipo="produto" />
                    </TabsContent>
                    <TabsContent value="saidas">
                        <NotasFiscaisTable data={notasSaida} tipo="saida" />
                    </TabsContent>
                    <TabsContent value="servicos">
                        <NotasFiscaisTable data={notasServico} tipo="servico" />
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
                             <span className="font-bold"> "{itemToDelete?.file?.name}"</span>.
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

function NotasFiscaisTable({ data, tipo }: { data: any[], tipo: 'produto' | 'saida' | 'servico' }) {
    const { toast } = useToast();

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhuma nota de {tipo} encontrada.</p>
            </div>
        );
    }
    
    const headers = tipo === 'servico' 
        ? ['Número', 'Prestador', 'Tomador', 'Valor Total']
        : ['Número', 'Emitente', 'Destinatário', 'Valor Total'];


    const renderRow = (item: any) => {
        const total = tipo === 'servico' 
            ? item.items.reduce((acc: number, service: ServiceItem) => acc + (Number(service.value) || 0), 0)
            : item.items.reduce((acc: number, product: ProductItem) => acc + product.total, 0);

        return (
            <>
                <TableCell className="font-medium">{item.dados.geral?.numero || item.dados.identificacao?.numero}</TableCell>
                <TableCell>{item.dados.emitente?.razaoSocial || item.dados.prestador?.razaoSocial}</TableCell>
                <TableCell>{item.dados.destinatario?.razaoSocial || item.dados.tomador?.razaoSocial}</TableCell>
                <TableCell className="text-right font-mono">
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
            </>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                        <TableHead className="w-[64px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
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
                                        <DropdownMenuItem onClick={() => toast({ title: 'Ação: Visualizar', description: `Visualizando item ${item.id}` })}>Visualizar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toast({ title: 'Ação: Editar', description: `Editando item ${item.id}` })}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toast({ variant: "destructive", title: 'Ação: Excluir', description: `Excluindo item ${item.id}` })} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

interface ProductItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

interface ServiceItem {
    id: number;
    name: string;
    value: number;
}

interface LancamentoDialogProps {
    onOpenChange: (open: boolean) => void;
    tipoNota: 'produto' | 'saida' | 'servico' | null;
    initialData?: any;
    onSave: (data: any) => void;
}


function LancamentoDialog({ onOpenChange, tipoNota, initialData, onSave }: LancamentoDialogProps) {
    const { toast } = useToast();
    const [productItems, setProductItems] = useState<ProductItem[]>([]);
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
    const [activeSection, setActiveSection] = useState('geral');
    const [tipoNotaValue, setTipoNotaValue] = useState('');
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (tipoNota) {
            const notaType = tipoNota === 'produto' ? 'entrada' : tipoNota;
            setTipoNotaValue(notaType);
            setActiveSection(tipoNota === 'servico' ? 'identificacao' : 'geral');
        }
        if (initialData) {
            setFormData(initialData);
            if (tipoNota === 'produto' || tipoNota === 'saida') {
                setProductItems(initialData.items || []);
            } else if (tipoNota === 'servico') {
                const initialServiceItem = initialData.servico?.descricao ? { id: Date.now(), name: initialData.servico.descricao, value: initialData.servico.valor || 0 } : null;
                setServiceItems(initialServiceItem ? [initialServiceItem] : []);
            }
        } else {
            setFormData({});
            setProductItems([]);
            setServiceItems([]);
        }
    }, [tipoNota, initialData]);

    const notaLabel = tipoNota === 'servico' ? 'de Serviço' : (tipoNota === 'produto' ? 'de Produto' : 'de Saída');

    const handleInputChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            }
        }));
    };

    const productSections = [
        { id: 'geral', label: 'Dados Gerais' },
        { id: 'emitente', label: 'Emitente / Dest.' },
        { id: 'produtos', label: 'Itens da Nota' },
        { id: 'tributos', label: 'Tributos' },
        { id: 'transporte', label: 'Transporte' },
        { id: 'faturas', label: 'Faturas' },
        { id: 'info', label: 'Informações Adicionais' },
    ];
    
    const serviceSections = [
        { id: 'identificacao', label: 'Identificação' },
        { id: 'prestador', label: 'Prestador' },
        { id: 'tomador', label: 'Tomador' },
        { id: 'servico', label: 'Dados do Serviço' },
        { id: 'tributos', label: 'Tributos' },
        { id: 'pagamento', label: 'Pagamento' },
        { id: 'info', label: 'Info Adicionais' },
    ];

    const sections = tipoNota === 'servico' ? serviceSections : productSections;

    // Product Handlers
    const handleAddProduct = () => {
        const newItem: ProductItem = { id: Date.now(), name: 'Novo Produto', quantity: 1, price: 0.0, total: 0.0 };
        setProductItems(prev => [...prev, newItem]);
    };

    const handleRemoveProduct = (id: number) => {
        setProductItems(prev => prev.filter(item => item.id !== id));
    };
    
    const handleProductChange = (id: number, field: keyof Omit<ProductItem, 'id' | 'total'>, value: string | number) => {
        setProductItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                const quantity = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
                const price = field === 'price' ? Number(value) : Number(updatedItem.price);
    
                if (!isNaN(quantity) && !isNaN(price)) {
                    updatedItem.total = quantity * price;
                }
                return updatedItem;
            }
            return item;
        }));
    };
    

    // Service Handlers
    const handleAddService = () => {
        const newItem: ServiceItem = { id: Date.now(), name: 'Novo Serviço', value: 0.0 };
        setServiceItems(prev => [...prev, newItem]);
    };

    const handleRemoveService = (id: number) => {
        setServiceItems(prev => prev.filter(item => item.id !== id));
    };

    const handleServiceChange = (id: number, field: keyof Omit<ServiceItem, 'id'>, value: string | number) => {
        setServiceItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };
    
    const handleSave = () => {
        const dataToSave = { 
            tipo: tipoNotaValue,
            dados: formData,
            items: tipoNota === 'servico' ? serviceItems : productItems,
        };

        onSave(dataToSave);
    
        toast({
          title: "Nota Fiscal Lançada",
          description: `A nota fiscal ${notaLabel} foi salva com sucesso.`,
        });
    
        onOpenChange(false); 
    };

    const totalProdutos = productItems.reduce((acc, item) => acc + item.total, 0);
    const totalServicos = serviceItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
    
    const totalDescontos = 0; // Placeholder
    const totalImpostos = 0; // Placeholder
    const totalNota = tipoNota === 'servico' ? totalServicos : totalProdutos;
    const totalLiquido = totalNota - totalDescontos - totalImpostos;

    const renderServiceForm = () => {
        switch (activeSection) {
            case 'identificacao':
                return (
                    <Card>
                        <CardHeader><CardTitle>1. Identificação da Nota de Serviço</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2"><Label>Tipo da Nota</Label><Select><SelectTrigger><SelectValue placeholder="Prestado" /></SelectTrigger><SelectContent><SelectItem value="prestado">Prestado</SelectItem><SelectItem value="tomado">Tomado</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Número</Label><Input value={formData.identificacao?.numero || ''} onChange={(e) => handleInputChange('identificacao', 'numero', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Série</Label><Input value={formData.identificacao?.serie || ''} onChange={(e) => handleInputChange('identificacao', 'serie', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Data de Emissão</Label><Input type="datetime-local" value={formData.identificacao?.dataEmissao || ''} onChange={(e) => handleInputChange('identificacao', 'dataEmissao', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Competência</Label><Input type="month"/></div>
                                <div className="space-y-2 col-span-2"><Label>Natureza da Operação</Label><Input /></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Município da Prestação</Label><Input /></div>
                                <div className="space-y-2"><Label>Código IBGE</Label><Input /></div>
                                <div className="space-y-2"><Label>Regime Tributação</Label><Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="nenhum">Nenhum</SelectItem></SelectContent></Select></div>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center space-x-2"><Checkbox id="estimativa" /><Label htmlFor="estimativa">Estimativa</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="unipro" /><Label htmlFor="unipro">Soc. Uniprofissional</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="mei" /><Label htmlFor="mei">MEI</Label></div>
                            </div>
                        </CardContent>
                    </Card>
                )
            case 'prestador':
            case 'tomador':
                const sectionKey = activeSection as 'prestador' | 'tomador';
                return (
                     <Card>
                        <CardHeader><CardTitle>{sectionKey === 'prestador' ? '2. Dados do Prestador' : '3. Dados do Tomador'}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>CNPJ / CPF</Label><Input value={formData[sectionKey]?.cnpj || ''} onChange={(e) => handleInputChange(sectionKey, 'cnpj', e.target.value)} /></div>
                                <div className="space-y-2 col-span-2"><Label>Razão Social</Label><Input value={formData[sectionKey]?.razaoSocial || ''} onChange={(e) => handleInputChange(sectionKey, 'razaoSocial', e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Inscrição Municipal</Label><Input /></div>
                                <div className="space-y-2"><Label>Email</Label><Input type="email" /></div>
                                <div className="space-y-2"><Label>Telefone</Label><Input type="tel" /></div>
                            </div>
                             <Separator className="my-4"/>
                            <p className="text-sm font-medium text-foreground">Endereço</p>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2"><Label>CEP</Label><Input /></div>
                                <div className="space-y-2 col-span-2"><Label>Logradouro</Label><Input /></div>
                                <div className="space-y-2"><Label>Número</Label><Input /></div>
                                <div className="space-y-2"><Label>Complemento</Label><Input /></div>
                                <div className="space-y-2"><Label>Bairro</Label><Input /></div>
                                <div className="space-y-2"><Label>Cidade</Label><Input /></div>
                                <div className="space-y-2"><Label>UF</Label><Input /></div>
                            </div>
                        </CardContent>
                    </Card>
                )
            case 'servico':
                return (
                     <Card>
                        <CardHeader><CardTitle>4. Dados do Serviço</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2"><Label>Descrição Detalhada do Serviço</Label><Textarea value={formData.servico?.descricao || ''} onChange={(e) => handleInputChange('servico', 'descricao', e.target.value)} /></div>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                 <div className="space-y-2"><Label>Código do Serviço (Municipal)</Label><Input /></div>
                                 <div className="space-y-2"><Label>Item da Lista (LC 116)</Label><Input /></div>
                                 <div className="space-y-2"><Label>Local da Execução</Label><Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="mesmo">Mesmo Município</SelectItem><SelectItem value="outro">Outro Município</SelectItem><SelectItem value="exterior">Exterior</SelectItem></SelectContent></Select></div>
                             </div>
                             <Separator className="my-4"/>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                 <div className="space-y-2"><Label>Unidade</Label><Input /></div>
                                 <div className="space-y-2"><Label>Quantidade</Label><Input type="number" /></div>
                                 <div className="space-y-2"><Label>Valor Unitário</Label><Input type="number" value={formData.servico?.valor || ''} onChange={(e) => handleInputChange('servico', 'valor', e.target.value)} /></div>
                                 <div className="space-y-2"><Label>Desc. Condic.</Label><Input type="number" /></div>
                                 <div className="space-y-2"><Label>Desc. Incondic.</Label><Input type="number" /></div>
                             </div>
                        </CardContent>
                    </Card>
                )
            case 'tributos':
                return (
                    <Card>
                        <CardHeader><CardTitle>5. Tributos da NFS-e</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {/* ISS */}
                            <div>
                                <h4 className="font-semibold text-primary mb-2">ISS</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2"><Label>Responsável</Label><Select><SelectTrigger><SelectValue placeholder="Prestador" /></SelectTrigger><SelectContent><SelectItem value="prestador">Prestador</SelectItem><SelectItem value="tomador">Tomador (Retenção)</SelectItem></SelectContent></Select></div>
                                    <div className="space-y-2"><Label>Base de Cálculo</Label><Input type="number" readOnly value="0,00"/></div>
                                    <div className="space-y-2"><Label>Alíquota (%)</Label><Input type="number" /></div>
                                    <div className="space-y-2"><Label>Valor ISS</Label><Input type="number" readOnly value="0,00"/></div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <div className="flex items-center space-x-2"><Checkbox id="iss-incidencia" defaultChecked /><Label htmlFor="iss-incidencia">Incidência de ISS</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="simples" /><Label htmlFor="simples">Optante pelo Simples Nacional</Label></div>
                                </div>
                            </div>
                             <Separator />
                            {/* Retenções Federais */}
                            <div>
                                <h4 className="font-semibold text-primary mb-2">Retenções Federais (RFB)</h4>
                                <div className="space-y-3">
                                    {['IRRF', 'INSS', 'PIS', 'COFINS', 'CSLL'].map(imposto => (
                                        <div key={imposto} className="grid grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-2 items-center">
                                            <Label className="md:col-span-2 font-medium">{imposto}</Label>
                                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Base</Label><Input type="number" /></div>
                                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Alíquota (%)</Label><Input type="number" /></div>
                                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Valor</Label><Input type="number" readOnly value="0,00"/></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            case 'pagamento':
                 return (
                    <Card>
                        <CardHeader><CardTitle>6. Dados de Pagamento</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Forma de Pagamento</Label>
                                    <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>
                                        <SelectItem value="pix">Pix</SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="cartao">Cartão</SelectItem>
                                        <SelectItem value="transferencia">Transferência</SelectItem>
                                    </SelectContent></Select>
                                </div>
                                <div className="space-y-2"><Label>Nº de Parcelas</Label><Input type="number"/></div>
                                <div className="space-y-2"><Label>Valor</Label><Input type="number"/></div>
                                <div className="space-y-2"><Label>Vencimento</Label><Input type="date"/></div>
                            </div>
                        </CardContent>
                    </Card>
                )
            case 'info':
                 return (
                    <Card>
                        <CardHeader><CardTitle>7. Informações Adicionais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Observações ao Tomador</Label><Textarea rows={3} /></div>
                            <div className="space-y-2"><Label>Observações ao Fisco</Label><Textarea rows={3} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Nº do Processo</Label><Input /></div>
                                <div className="space-y-2"><Label>Código CNAE</Label><Input /></div>
                            </div>
                        </CardContent>
                    </Card>
                );
            default: return null;
        }
    }
  
    const renderProductForm = () => {
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
                                            <SelectItem value="servico">Serviço</SelectItem>
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
                                <div className="space-y-2"><Label htmlFor="nf-serie">Série</Label><Input id="nf-serie" value={formData.geral?.serie || ''} onChange={(e) => handleInputChange('geral', 'serie', e.target.value)}/></div>
                                <div className="space-y-2"><Label htmlFor="nf-numero">Número</Label><Input id="nf-numero" value={formData.geral?.numero || ''} onChange={(e) => handleInputChange('geral', 'numero', e.target.value)}/></div>
                                <div className="space-y-2"><Label htmlFor="nf-data-emissao">Data de Emissão</Label><Input id="nf-data-emissao" type="datetime-local" value={formData.geral?.dataEmissao || ''} onChange={(e) => handleInputChange('geral', 'dataEmissao', e.target.value)} /></div>
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
                                <div className="space-y-2"><Label htmlFor="emit-cnpj">CNPJ / CPF</Label><Input id="emit-cnpj" value={formData.emitente?.cnpj || ''} onChange={(e) => handleInputChange('emitente', 'cnpj', e.target.value)} /></div>
                                <div className="space-y-2 col-span-1 md:col-span-2"><Label htmlFor="emit-razao-social">Razão Social</Label><Input id="emit-razao-social" value={formData.emitente?.razaoSocial || ''} onChange={(e) => handleInputChange('emitente', 'razaoSocial', e.target.value)} /></div>
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
                        <CardHeader>
                            <CardTitle>Itens da Nota</CardTitle>
                        </CardHeader>
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
            case 'serviços': // Corrigido de 'servicos' para 'serviços'
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Serviços Prestados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow>
                                    <TableHead className="w-[60%]">Serviço</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                    {serviceItems.length > 0 ? serviceItems.map((item) => (
                                        <TableRow key={item.id} className="has-[:focus-visible]:bg-muted/40">
                                            <TableCell className="font-medium">
                                                <Input value={item.name} onChange={(e) => handleServiceChange(item.id, 'name', e.target.value)} className="h-8" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Input type="number" value={item.value} onChange={(e) => handleServiceChange(item.id, 'value', e.target.value)} className="h-8 w-32 text-right" />
                                            </TableCell>
                                            <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveService(item.id)}><X className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center">Nenhum serviço adicionado.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex justify-end"><Button variant="outline" onClick={handleAddService}><Plus className="mr-2 h-4 w-4" /> Adicionar Serviço</Button></div>
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
        
        <div className="flex-1 grid grid-cols-[240px_1fr] gap-6 overflow-hidden">
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
                <ScrollArea className="h-full pr-6">
                    {tipoNota === 'servico' ? renderServiceForm() : renderProductForm()}
                </ScrollArea>
            </main>
        </div>

        <DialogFooter className="border-t pt-4 mt-auto">
            <div className="flex w-full justify-between items-center">
                <div className="text-sm text-muted-foreground space-y-1">
                   {tipoNota === 'servico' ? (
                        <>
                            <p>Total Serviços: <span className="font-semibold text-foreground">{totalServicos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                            <p>Total Descontos: <span className="font-semibold text-foreground">({totalDescontos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</span></p>
                            <p>Total Impostos Retidos: <span className="font-semibold text-red-600">({totalImpostos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</span></p>
                            <p className="text-base">Total Líquido: <span className="font-bold text-foreground text-lg">{totalLiquido.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                        </>
                   ) : (
                        <>
                            <p>Total Produtos: <span className="font-bold text-foreground">{totalProdutos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                            <p>Total Nota: <span className="font-bold text-foreground text-lg">{totalNota.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                        </>
                   )}
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
