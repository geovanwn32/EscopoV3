
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PackagePlus, FileText, Wrench, Upload, FileMinus, Receipt, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const actions = [
    {
        icon: <Upload className="h-8 w-8" />,
        label: "Importar XML",
        href: "#",
        color: "text-sky-600 bg-sky-100/80 group-hover:bg-sky-600 dark:bg-sky-900/40 dark:text-sky-400 dark:group-hover:bg-sky-500",
    },
    {
        icon: <PackagePlus className="h-8 w-8" />,
        label: "Nota Produto",
        href: "#",
        color: "text-emerald-600 bg-emerald-100/80 group-hover:bg-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 dark:group-hover:bg-emerald-500",
    },
    {
        icon: <FileMinus className="h-8 w-8" />,
        label: "Nota Saída",
        href: "#",
        color: "text-amber-600 bg-amber-100/80 group-hover:bg-amber-600 dark:bg-amber-900/40 dark:text-amber-400 dark:group-hover:bg-amber-500",
    },
    {
        icon: <Wrench className="h-8 w-8" />,
        label: "Nota Serviço",
        href: "#",
        color: "text-indigo-600 bg-indigo-100/80 group-hover:bg-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 dark:group-hover:bg-indigo-500",
    },
    {
        icon: <Receipt className="h-8 w-8" />,
        label: "Recibos/Cupons",
        href: "#",
        color: "text-slate-600 bg-slate-100/80 group-hover:bg-slate-600 dark:bg-slate-700/40 dark:text-slate-400 dark:group-hover:bg-slate-500",
    },
]

const mockXmls = [
    { id: 1, file: 'NFe_44312.xml', date: '25/07/2024', status: 'Processado' },
    { id: 2, file: 'NFe_44313.xml', date: '25/07/2024', status: 'Processado' },
    { id: 3, file: 'CTe_8891.xml', date: '24/07/2024', status: 'Erro' },
];

const mockNotasProduto = [
    { id: 1, number: '1254', client: 'ABC Indústria Ltda', value: 'R$ 15.400,00', status: 'Emitida' },
    { id: 2, number: '1255', client: 'XYZ Comércio S.A.', value: 'R$ 8.250,50', status: 'Emitida' },
];

const mockNotasSaida = [
    { id: 1, number: '501', client: 'Logística Total', value: 'R$ 1.200,00', status: 'Cancelada' },
];

const mockNotasServico = [
    { id: 1, number: '88', client: 'Consultoria Eficaz', value: 'R$ 5.000,00', status: 'Emitida' },
];

const mockRecibos = [
    { id: 1, number: 'C-0012', client: 'Consumidor Final', value: 'R$ 150,00', status: 'Emitido' },
];


export default function FiscalPage() {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Lançamentos Fiscais</h1>
          <p className="text-muted-foreground">
            Importe XMLs ou lance manually suas notas e recibos.
          </p>
        </div>

        <Card>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-6">
                {actions.map((action) => (
                    <ActionTile key={action.label} {...action} />
                ))}
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>XMLs Importados</CardTitle>
                    <CardDescription>Documentos fiscais importados recentemente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentDocumentsTable
                        headers={['Arquivo', 'Data Importação', 'Status']}
                        data={mockXmls}
                        renderRow={(item) => (
                            <>
                                <TableCell className="font-medium">{item.file}</TableCell>
                                <TableCell>{item.date}</TableCell>
                                <TableCell><Badge variant={item.status === 'Processado' ? 'secondary' : 'destructive'}>{item.status}</Badge></TableCell>
                            </>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notas de Produto</CardTitle>
                    <CardDescription>Notas fiscais de produto emitidas recentemente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentDocumentsTable
                        headers={['Número', 'Cliente', 'Valor', 'Status']}
                        data={mockNotasProduto}
                        renderRow={(item) => (
                            <>
                                <TableCell className="font-medium">{item.number}</TableCell>
                                <TableCell>{item.client}</TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell><Badge>{item.status}</Badge></TableCell>
                            </>
                        )}
                    />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Notas de Saída</CardTitle>
                    <CardDescription>Notas fiscais de saída emitidas recentemente.</CardDescription>
                </CardHeader>
                <CardContent>
                     <RecentDocumentsTable
                        headers={['Número', 'Destinatário', 'Valor', 'Status']}
                        data={mockNotasSaida}
                        renderRow={(item) => (
                            <>
                                <TableCell className="font-medium">{item.number}</TableCell>
                                <TableCell>{item.client}</TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell><Badge variant="destructive">{item.status}</Badge></TableCell>
                            </>
                        )}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Notas de Serviço</CardTitle>
                    <CardDescription>Notas fiscais de serviço emitidas recentemente.</CardDescription>
                </CardHeader>
                <CardContent>
                     <RecentDocumentsTable
                        headers={['Número', 'Tomador', 'Valor', 'Status']}
                        data={mockNotasServico}
                        renderRow={(item) => (
                            <>
                                <TableCell className="font-medium">{item.number}</TableCell>
                                <TableCell>{item.client}</TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell><Badge>{item.status}</Badge></TableCell>
                            </>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recibos/Cupons</CardTitle>
                    <CardDescription>Recibos e cupons fiscais emitidos recentemente.</CardDescription>
                </CardHeader>
                <CardContent>
                     <RecentDocumentsTable
                        headers={['Número', 'Cliente', 'Valor', 'Status']}
                        data={mockRecibos}
                        renderRow={(item) => (
                            <>
                                <TableCell className="font-medium">{item.number}</TableCell>
                                <TableCell>{item.client}</TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                            </>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
      </div>
    );
}

function ActionTile({ icon, label, href = "#", color }: { icon: React.ReactNode, label: string, href?: string, color: string }) {
  return (
    <Link href={href}>
        <div className="group flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className={cn(
                "rounded-full p-3 transition-colors group-hover:text-primary-foreground",
                color
            )}>
                {icon}
            </div>
            <span className="text-center text-sm font-semibold">{label}</span>
        </div>
    </Link>
  )
}

function RecentDocumentsTable({ headers, data, renderRow }: { headers: string[], data: any[], renderRow: (item: any) => React.ReactNode }) {
    return (
        <div className="overflow-x-auto">
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
                                    <DropdownMenuItem>Visualizar</DropdownMenuItem>
                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
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
