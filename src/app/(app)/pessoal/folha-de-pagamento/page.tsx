'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useCompany } from '@/hooks/use-company';
import { Funcionario } from '@/types/pessoal';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, Loader2, FileText, BookCopy, ChevronsUpDown, Check, Search, FileUp, Sparkles, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Rubrica } from '../../rubricas/page';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';


interface Lancamento {
  id: number;
  funcionarioId: number;
  rubricaId: number;
  valor: number;
  referencia?: number;
}

interface ResultadoFolha {
  funcionarioId: number;
  nome: string;
  totalProventos: number;
  totalDescontos: number;
  salarioLiquido: number;
  baseINSS: number;
  valorINSS: number;
  baseIRRF: number;
  valorIRRF: number;
  baseFGTS: number;
  valorFGTS: number;
  detalhes: {
    rubrica: string;
    tipo: 'Provento' | 'Desconto';
    valor: number;
  }[];
}

interface LancamentoModelo {
    id: number;
    rubricaId: number;
    valor: number;
    descricao: string;
}

const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, 'label': 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, 'label': 'Outubro' }, { value: 11, 'label': 'Novembro' }, { value: 12, 'label': 'Dezembro' }
];

const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

// --- FUNÇÕES DE CÁLCULO DE IMPOSTOS ---

// Tabela INSS (Exemplo 2024 - substitua se necessário)
const getContribuicaoINSS = (baseCalculo: number) => {
    if (baseCalculo <= 1412.00) return baseCalculo * 0.075;
    if (baseCalculo <= 2666.68) return (baseCalculo * 0.09) - 21.18;
    if (baseCalculo <= 4000.03) return (baseCalculo * 0.12) - 101.18;
    if (baseCalculo <= 7786.02) return (baseCalculo * 0.14) - 181.18;
    return 908.85; // Teto de contribuição
};

// Tabela IRRF (Exemplo 2024 - substitua se necessário)
const getContribuicaoIRRF = (baseCalculo: number, numDependentes: number) => {
    const deducaoPorDependente = 189.59;
    const baseAjustada = baseCalculo - (numDependentes * deducaoPorDependente);

    if (baseAjustada <= 2259.20) return 0;
    if (baseAjustada <= 2826.65) return (baseAjustada * 0.075) - 169.44;
    if (baseAjustada <= 3751.05) return (baseAjustada * 0.15) - 381.44;
    if (baseAjustada <= 4664.68) return (baseAjustada * 0.225) - 662.77;
    return (baseAjustada * 0.275) - 896.00;
};


export default function FolhaDePagamentoPage() {
    const { toast } = useToast();
    const { useScopedData, companies, currentCompany } = useCompany();
    const [funcionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    const [rubricas] = useScopedData<Rubrica[]>('cadastros-rubricas', []);
    const [modelos, setModelos] = useScopedData<LancamentoModelo[]>('pessoal-lancamentos-recorrentes', []);
    
    const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
    const [ano, setAno] = useState<number>(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFuncionarios, setSelectedFuncionarios] = useState<number[]>([]);
    const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
    const [resultados, setResultados] = useState<ResultadoFolha[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const activeCompany = useMemo(() => companies.find(c => c.id === currentCompany), [companies, currentCompany]);

    const filteredFuncionarios = useMemo(() => {
        return funcionarios.filter(f => 
            f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.cpf.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [funcionarios, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedFuncionarios(checked ? filteredFuncionarios.map(f => f.id) : []);
    };
    
    const handleAddLancamento = (rubricaId: number, tipo: 'coletivo' | 'individual', funcionarioId?: number) => {
        if (!rubricaId) return;
        const targetFuncionarios = tipo === 'coletivo' ? selectedFuncionarios : (funcionarioId ? [funcionarioId] : []);
        if(targetFuncionarios.length === 0) {
            toast({variant: 'destructive', title: 'Nenhum funcionário selecionado!'});
            return;
        }

        const newLancamentos = targetFuncionarios.map(funcId => ({
            id: Date.now() + Math.random(), funcionarioId: funcId, rubricaId: rubricaId, valor: 0,
        }));
        setLancamentos(prev => [...prev, ...newLancamentos]);
    };

    const handleRemoveLancamento = (id: number) => {
        setLancamentos(prev => prev.filter(l => l.id !== id));
    };

    const handleLancamentoChange = (id: number, field: 'valor' | 'referencia', value: number) => {
        setLancamentos(prev => prev.map(l => l.id === id ? {...l, [field]: value} : l));
    };

    const aplicarModelos = () => {
        if (selectedFuncionarios.length === 0) {
            toast({variant: 'destructive', title: 'Selecione funcionários', description: 'Nenhum funcionário foi selecionado para aplicar os modelos.'});
            return;
        }
        if (modelos.length === 0) {
            toast({variant: 'destructive', title: 'Sem Modelos', description: 'Nenhum lançamento modelo foi cadastrado ainda.'});
            return;
        }

        const novosLancamentos = selectedFuncionarios.flatMap(funcId => 
            modelos.map(modelo => ({
                id: Date.now() + Math.random(),
                funcionarioId: funcId,
                rubricaId: modelo.rubricaId,
                valor: modelo.valor,
            }))
        );

        setLancamentos(prev => [...prev, ...novosLancamentos]);
        toast({title: 'Modelos Aplicados', description: `${modelos.length} modelo(s) aplicado(s) para ${selectedFuncionarios.length} funcionário(s).`});
    }
    
    const handleCalcularFolha = () => {
        if (selectedFuncionarios.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum funcionário selecionado', description: 'Selecione pelo menos um funcionário para calcular a folha.' });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const novosResultados = selectedFuncionarios.map(funcId => {
                const funcionario = funcionarios.find(f => f.id === funcId);
                if (!funcionario) return null;

                const lancamentosFunc = lancamentos.filter(l => l.funcionarioId === funcId);

                const getValorRubrica = (tipo: 'Provento' | 'Desconto', incidePara?: keyof Rubrica['incidencias']) => {
                    return lancamentosFunc.reduce((acc, l) => {
                        const rubrica = rubricas.find(r => r.id === l.rubricaId);
                        if (rubrica?.tipo === tipo && (incidePara ? rubrica.incidencias[incidePara] : true)) {
                            return acc + l.valor;
                        }
                        return acc;
                    }, 0);
                };
                
                const salarioBase = funcionario.salario;
                const outrosProventos = getValorRubrica('Provento');
                const totalProventos = salarioBase + outrosProventos;

                const baseINSS = salarioBase + getValorRubrica('Provento', 'inss');
                const valorINSS = getContribuicaoINSS(baseINSS);

                const baseIRRF = salarioBase + getValorRubrica('Provento', 'irrf') - valorINSS;
                const numDependentes = funcionario.dependentes?.length || 0;
                const valorIRRF = getContribuicaoIRRF(baseIRRF, numDependentes);

                const baseFGTS = salarioBase + getValorRubrica('Provento', 'fgts');
                const valorFGTS = baseFGTS * 0.08;

                const outrosDescontos = getValorRubrica('Desconto');
                const totalDescontos = outrosDescontos + valorINSS + valorIRRF;
                
                const detalhes = [
                    { rubrica: 'Salário Base', tipo: 'Provento', valor: salarioBase },
                    ...lancamentosFunc.map(l => {
                        const rubrica = rubricas.find(r => r.id === l.rubricaId);
                        return { rubrica: rubrica?.descricao || 'N/D', tipo: rubrica?.tipo === 'Provento' ? 'Provento' : 'Desconto', valor: l.valor }
                    }).filter(d => d.tipo === 'Provento' && d.valor > 0),
                    ...lancamentosFunc.map(l => {
                        const rubrica = rubricas.find(r => r.id === l.rubricaId);
                        return { rubrica: rubrica?.descricao || 'N/D', tipo: rubrica?.tipo === 'Desconto' ? 'Desconto' : 'Provento', valor: l.valor }
                    }).filter(d => d.tipo === 'Desconto' && d.valor > 0),
                    { rubrica: 'INSS', tipo: 'Desconto', valor: valorINSS },
                    { rubrica: 'IRRF', tipo: 'Desconto', valor: valorIRRF },
                ];

                return {
                    funcionarioId: funcId, nome: funcionario.nome, totalProventos, totalDescontos,
                    salarioLiquido: totalProventos - totalDescontos, baseINSS, valorINSS, baseIRRF, valorIRRF, baseFGTS, valorFGTS, detalhes
                };
            }).filter((r): r is ResultadoFolha => r !== null);
            
            setResultados(novosResultados);
            setIsLoading(false);
            toast({title: "Folha de Pagamento Calculada!", description: `${novosResultados.length} funcionários processados.`});
        }, 1500);
    };

    const gerarHoleritesPDF = () => {
        const doc = new jsPDF();
        
        resultados.forEach((res, index) => {
            if (index > 0) doc.addPage();
            const funcionario = funcionarios.find(f => f.id === res.funcionarioId);
    
            // Cabeçalho
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Recibo de Pagamento de Salário (Holerite)', 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Competência: ${meses.find(m => m.value === mes)?.label}/${ano}`, 105, 28, { align: 'center' });
    
            // Dados da Empresa e Funcionário
            autoTable(doc, {
                body: [
                    [
                        { content: 'EMPRESA CONTRATANTE', styles: { fontStyle: 'bold' } },
                        { content: 'FUNCIONÁRIO(A)', styles: { fontStyle: 'bold' } }
                    ],
                    [
                        `Nome: ${activeCompany?.name || 'N/D'}\nCNPJ: ${activeCompany?.data?.cnpj || 'N/D'}`,
                        `Nome: ${res.nome}\nCPF: ${funcionario?.cpf || 'N/D'}\nCargo: ${funcionario?.cargo || 'N/D'}`
                    ],
                ],
                startY: 35,
                theme: 'grid',
                styles: { cellPadding: 2, fontSize: 9, overflow: 'linebreak' }
            });
    
            const finalY = (doc as any).lastAutoTable.finalY;
    
            // Detalhes da Folha
            const body = res.detalhes.map(d => [
                d.rubrica,
                d.tipo === 'Provento' ? d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
                d.tipo === 'Desconto' ? d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
            ]);
    
            autoTable(doc, {
                head: [['Descrição', 'Proventos (R$)', 'Descontos (R$)']],
                body: body,
                startY: finalY + 5,
                theme: 'striped',
                headStyles: { fillColor: [22, 163, 74] },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'right' }
                }
            });

            // Totais
            const totalY = (doc as any).lastAutoTable.finalY;
            doc.setFont('helvetica', 'bold');
            doc.text('Total de Proventos:', 14, totalY + 10);
            doc.text(res.totalProventos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 98, totalY + 10, { align: 'right' });
            doc.text('Total de Descontos:', 110, totalY + 10);
            doc.text(res.totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 196, totalY + 10, { align: 'right' });

            doc.setLineWidth(0.5);
            doc.line(14, totalY + 13, 196, totalY + 13);
            
            doc.setFontSize(14);
            doc.text('SALÁRIO LÍQUIDO:', 14, totalY + 20);
            doc.text(res.salarioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 196, totalY + 20, { align: 'right' });
            doc.setFontSize(12);

             // Bases de Cálculo
            const basesY = totalY + 30;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Base INSS: ${res.baseINSS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, basesY);
            doc.text(`Base FGTS: ${res.baseFGTS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 70, basesY);
            doc.text(`FGTS do Mês: ${res.valorFGTS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 130, basesY);
            doc.text(`Base IRRF: ${res.baseIRRF.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, basesY + 5);
        });
    
        doc.save(`Holerites_${mes}_${ano}.pdf`);
        toast({title: "Holerites Gerados", description: "O arquivo PDF com os holerites foi baixado."});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Link href="/pessoal">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Folha de Pagamento</h1>
                    <p className="text-muted-foreground">Calcule a folha de pagamento mensal de seus funcionários.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>1. Seleção de Competência e Funcionários</CardTitle><CardDescription>Escolha o período e os funcionários para o cálculo.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="mes">Mês</Label><Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}><SelectTrigger id="mes"><SelectValue /></SelectTrigger><SelectContent>{meses.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent></Select></div>
                                <div className="space-y-2"><Label htmlFor="ano">Ano</Label><Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}><SelectTrigger id="ano"><SelectValue /></SelectTrigger><SelectContent>{anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent></Select></div>
                            </div>
                            <div className="relative pt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar funcionário por nome ou CPF..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="rounded-md border max-h-[300px] overflow-y-auto mt-2">
                                <Table><TableHeader className="sticky top-0 bg-background z-10"><TableRow><TableHead className="w-[50px]"><Checkbox onCheckedChange={handleSelectAll} checked={selectedFuncionarios.length === filteredFuncionarios.length && filteredFuncionarios.length > 0} /></TableHead><TableHead>Nome</TableHead><TableHead>Cargo</TableHead><TableHead className='text-right'>Salário Base</TableHead></TableRow></TableHeader>
                                    <TableBody>{filteredFuncionarios.map(f => (<TableRow key={f.id} data-state={selectedFuncionarios.includes(f.id) && "selected"}><TableCell><Checkbox checked={selectedFuncionarios.includes(f.id)} onCheckedChange={checked => setSelectedFuncionarios(prev => checked ? [...prev, f.id] : prev.filter(id => id !== f.id))} /></TableCell><TableCell className="font-medium">{f.nome}</TableCell><TableCell>{f.cargo}</TableCell><TableCell className="text-right font-mono">{f.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell></TableRow>))}
                                        {filteredFuncionarios.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum funcionário encontrado.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>2. Lançamento de Rubricas</CardTitle><CardDescription>Adicione eventos como horas extras, comissões, faltas ou adiantamentos.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <LancadorDeRubrica onAddLancamento={handleAddLancamento} rubricas={rubricas} />
                             <Button variant="outline" onClick={aplicarModelos} className="w-full"><Sparkles className="mr-2 h-4 w-4" />Aplicar Modelos</Button>
                             <Button variant="secondary" disabled className="w-full"><FileUp className="mr-2 h-4 w-4" />Importar Ponto (Em Breve)</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Lançamentos Modelo</CardTitle><CardDescription>Gerencie lançamentos recorrentes.</CardDescription></CardHeader>
                        <CardContent><LancamentosModelo modelos={modelos} setModelos={setModelos} rubricas={rubricas}/></CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Lançamentos Realizados</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border max-h-72 overflow-y-auto">
                        <Table><TableHeader><TableRow><TableHead>Funcionário</TableHead><TableHead>Rubrica</TableHead><TableHead>Tipo</TableHead><TableHead>Referência</TableHead><TableHead className="text-right">Valor (R$)</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
                            <TableBody>
                                {lancamentos.map(l => {
                                    const func = funcionarios.find(f => f.id === l.funcionarioId);
                                    const rubrica = rubricas.find(r => r.id === l.rubricaId);
                                    return (<TableRow key={l.id}><TableCell>{func?.nome}</TableCell><TableCell>{rubrica?.descricao}</TableCell><TableCell><Badge variant={rubrica?.tipo === 'Provento' ? 'default' : 'destructive'}>{rubrica?.tipo}</Badge></TableCell><TableCell><Input type="number" value={l.referencia || ''} onChange={e => handleLancamentoChange(l.id, 'referencia', parseFloat(e.target.value))} className='h-8 w-24'/></TableCell><TableCell className="text-right"><Input type="number" value={l.valor} onChange={e => handleLancamentoChange(l.id, 'valor', parseFloat(e.target.value))} className='h-8 w-32 text-right'/></TableCell><TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveLancamento(l.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>)
                                })}
                                {lancamentos.length === 0 && <TableRow><TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>Nenhum lançamento adicionado.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleCalcularFolha} disabled={isLoading}>{isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Calculator className="mr-2 h-4 w-4" />}{isLoading ? 'Calculando...' : 'Calcular Folha'}</Button>
                </CardFooter>
            </Card>

            {resultados.length > 0 && (
                 <Card><CardHeader><CardTitle>3. Resultados do Cálculo</CardTitle><CardDescription>Resumo da folha de pagamento processada para o mês de {meses.find(m => m.value === mes)?.label} de {ano}.</CardDescription></CardHeader>
                    <CardContent>
                        <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Funcionário</TableHead><TableHead className="text-right">Proventos</TableHead><TableHead className="text-right">Descontos</TableHead><TableHead className="text-right">Salário Líquido</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {resultados.map(res => (<TableRow key={res.funcionarioId}><TableCell className="font-medium">{res.nome}</TableCell><TableCell className="text-right font-mono text-emerald-600">{res.totalProventos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell><TableCell className="text-right font-mono text-destructive">{res.totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell><TableCell className="text-right font-mono font-bold">{res.salarioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell></TableRow>))}
                            </TableBody></Table>
                         </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={gerarHoleritesPDF}><FileText className='mr-2 h-4 w-4'/> Gerar Holerites (PDF)</Button>
                        <Button variant="outline" disabled><BookCopy className='mr-2 h-4 w-4'/> Contabilizar Folha</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

function LancadorDeRubrica({ onAddLancamento, rubricas }: { onAddLancamento: (id: number, tipo: 'coletivo') => void; rubricas: Rubrica[] }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
 
    const handleSelect = (rubricaId: string) => {
        if (rubricaId) {
            onAddLancamento(Number(rubricaId), 'coletivo');
            setValue(""); setOpen(false);
        }
    };
    return (
        <div className='space-y-2'><Label>Adicionar Rubrica Coletivamente</Label>
            <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">{value ? rubricas.find(r => String(r.id) === value)?.descricao : "Selecione uma rubrica..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Buscar rubrica..." /><CommandEmpty>Nenhuma rubrica encontrada.</CommandEmpty>
                    <CommandList><CommandGroup>{rubricas.map(r => (<CommandItem key={r.id} value={`${r.codigo} - ${r.descricao}`} onSelect={() => handleSelect(String(r.id))}><Check className={cn("mr-2 h-4 w-4", value === String(r.id) ? "opacity-100" : "opacity-0")} />{r.codigo} - {r.descricao} <Badge variant={r.tipo === 'Provento' ? 'default' : 'destructive'} className="ml-auto">{r.tipo}</Badge></CommandItem>))}</CommandGroup></CommandList>
                </Command></PopoverContent>
            </Popover>
        </div>
    )
}

function LancamentosModelo({ modelos, setModelos, rubricas }: { modelos: LancamentoModelo[], setModelos: (value: LancamentoModelo[] | ((prev: LancamentoModelo[]) => LancamentoModelo[])) => void, rubricas: Rubrica[]}) {
    const [newRubricaId, setNewRubricaId] = useState<string | undefined>(undefined);
    const [newValor, setNewValor] = useState<number | ''>('');
    const [newDescricao, setNewDescricao] = useState('');

    const handleAddModelo = () => {
        if (newRubricaId && newValor !== '') {
            const rubrica = rubricas.find(r => r.id === Number(newRubricaId));
            const newModelo: LancamentoModelo = {
                id: Date.now(),
                rubricaId: Number(newRubricaId),
                valor: newValor,
                descricao: newDescricao || rubrica?.descricao || 'Novo Modelo'
            };
            setModelos(prev => [...prev, newModelo]);
            setNewRubricaId(undefined); setNewValor(''); setNewDescricao('');
        }
    };

    const handleRemoveModelo = (id: number) => {
        setModelos(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="space-y-3">
             {modelos.map(modelo => {
                const rubrica = rubricas.find(r => r.id === modelo.rubricaId);
                return (<div key={modelo.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-md border"><div className='flex-1 truncate'><strong>{modelo.descricao}</strong>: {modelo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({rubrica?.codigo})</div><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveModelo(modelo.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>);
             })}
             <Separator/>
             <div className="space-y-2">
                <Label className='text-xs'>Novo Modelo</Label>
                <Select value={newRubricaId} onValueChange={setNewRubricaId}><SelectTrigger><SelectValue placeholder="Selecione a rubrica..." /></SelectTrigger><SelectContent><Command><CommandInput placeholder="Buscar rubrica..." /><CommandEmpty>Nenhuma rubrica encontrada.</CommandEmpty><CommandList><CommandGroup>{rubricas.map(r => (<CommandItem key={r.id} value={String(r.id)} onSelect={() => setNewRubricaId(String(r.id))}>{r.codigo} - {r.descricao}</CommandItem>))}</CommandGroup></CommandList></Command></SelectContent></Select>
                <Input value={newDescricao} onChange={e => setNewDescricao(e.target.value)} placeholder="Descrição (opcional)" />
                <Input type="number" value={newValor} onChange={e => setNewValor(parseFloat(e.target.value) || '')} placeholder="Valor" />
                <Button onClick={handleAddModelo} size="sm" className="w-full">Adicionar Modelo</Button>
            </div>
        </div>
    )
}
