
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '@/hooks/use-company';
import type { Funcionario } from '@/types/pessoal';
import { useToast } from '@/hooks/use-toast';
import { Calculator, FileText, Loader2, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Separator } from '@/components/ui/separator';

// --- FUNÇÕES DE CÁLCULO DE IMPOSTOS ---
const getContribuicaoINSS = (baseCalculo: number) => {
    if (baseCalculo <= 1412.00) return baseCalculo * 0.075;
    if (baseCalculo <= 2666.68) return (baseCalculo * 0.09) - 21.18;
    if (baseCalculo <= 4000.03) return (baseCalculo * 0.12) - 101.18;
    if (baseCalculo <= 7786.02) return (baseCalculo * 0.14) - 181.18;
    return 908.85; // Teto de contribuição
};

const getContribuicaoIRRF = (baseCalculo: number, numDependentes: number) => {
    const deducaoPorDependente = 189.59;
    const baseAjustada = baseCalculo - (numDependentes * deducaoPorDependente);
    if (baseAjustada <= 2259.20) return 0;
    if (baseAjustada <= 2826.65) return (baseAjustada * 0.075) - 169.44;
    if (baseAjustada <= 3751.05) return (baseAjustada * 0.15) - 381.44;
    if (baseAjustada <= 4664.68) return (baseAjustada * 0.225) - 662.77;
    return (baseAjustada * 0.275) - 896.00;
};

interface Resultado13 {
    funcionarioId: string;
    nome: string;
    salarioBruto: number;
    mesesTrabalhados: number;
    valorBruto13: number;
    adiantamento: number;
    valorINSS: number;
    valorIRRF: number;
    totalDescontos: number;
    liquidoAPagar: number;
    tipo: '1ª Parcela' | '2ª Parcela' | 'Parcela Única';
}

const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

export default function DecimoTerceiroPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [funcionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    
    const [selectedFuncionarioIds, setSelectedFuncionarioIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ano, setAno] = useState<number>(new Date().getFullYear());
    const [tipoCalculo, setTipoCalculo] = useState<'1ª Parcela' | '2ª Parcela' | 'Parcela Única'>('1ª Parcela');
    
    const [isLoading, setIsLoading] = useState(false);
    const [resultados, setResultados] = useState<Resultado13[]>([]);

    const filteredFuncionarios = useMemo(() => {
        return funcionarios.filter(f => 
            f.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [funcionarios, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedFuncionarioIds(checked ? filteredFuncionarios.map(f => f.id) : []);
    };

    const handleCalcular = () => {
        if (selectedFuncionarioIds.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum funcionário selecionado' });
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const novosResultados = selectedFuncionarioIds.map(id => {
                const funcionario = funcionarios.find(f => f.id === id);
                if (!funcionario) return null;

                const dataAdmissao = new Date(funcionario.dataAdmissao);
                const anoAdmissao = dataAdmissao.getFullYear();
                
                let mesesTrabalhados = 12;
                if (anoAdmissao === ano) {
                    mesesTrabalhados = 12 - dataAdmissao.getMonth();
                    if (dataAdmissao.getDate() > 15) {
                        mesesTrabalhados -= 1;
                    }
                } else if (anoAdmissao > ano) {
                    return null; // Não tem direito
                }
                
                const valorBruto13 = (funcionario.salario / 12) * mesesTrabalhados;
                let adiantamento = 0;
                let valorINSS = 0;
                let valorIRRF = 0;
                let liquidoAPagar = 0;

                switch (tipoCalculo) {
                    case '1ª Parcela':
                        liquidoAPagar = valorBruto13 / 2;
                        break;
                    case '2ª Parcela':
                        adiantamento = valorBruto13 / 2;
                        valorINSS = getContribuicaoINSS(valorBruto13);
                        const baseIRRF = valorBruto13 - valorINSS - ((funcionario.dependentes?.length || 0) * 189.59);
                        valorIRRF = getContribuicaoIRRF(baseIRRF, funcionario.dependentes?.length || 0);
                        liquidoAPagar = valorBruto13 - adiantamento - valorINSS - valorIRRF;
                        break;
                    case 'Parcela Única':
                        valorINSS = getContribuicaoINSS(valorBruto13);
                        const baseIRRFUnica = valorBruto13 - valorINSS - ((funcionario.dependentes?.length || 0) * 189.59);
                        valorIRRF = getContribuicaoIRRF(baseIRRFUnica, funcionario.dependentes?.length || 0);
                        liquidoAPagar = valorBruto13 - valorINSS - valorIRRF;
                        break;
                }

                return {
                    funcionarioId: funcionario.id,
                    nome: funcionario.nome,
                    salarioBruto: funcionario.salario,
                    mesesTrabalhados,
                    valorBruto13,
                    adiantamento,
                    valorINSS,
                    valorIRRF,
                    totalDescontos: valorINSS + valorIRRF,
                    liquidoAPagar,
                    tipo: tipoCalculo,
                };
            }).filter((r): r is Resultado13 => r !== null);

            setResultados(novosResultados);
            setIsLoading(false);
            toast({ title: 'Cálculo Realizado!', description: `${novosResultados.length} funcionários processados.` });
        }, 500);
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cálculo de 13º Salário</h1>
                    <p className="text-muted-foreground">Calcule a 1ª, 2ª ou parcela única do 13º salário.</p>
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Dados para o Cálculo</CardTitle>
                    <CardDescription>Selecione o tipo de cálculo, o ano e os funcionários.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo de Cálculo</Label>
                            <Select value={tipoCalculo} onValueChange={(v: any) => setTipoCalculo(v)}>
                                <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1ª Parcela">1ª Parcela (Adiantamento)</SelectItem>
                                    <SelectItem value="2ª Parcela">2ª Parcela</SelectItem>
                                    <SelectItem value="Parcela Única">Parcela Única</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ano">Ano</Label>
                            <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
                                <SelectTrigger id="ano"><SelectValue /></SelectTrigger>
                                <SelectContent>{anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar funcionário..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="rounded-md border max-h-60 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead className="w-[50px]"><Checkbox onCheckedChange={handleSelectAll} checked={selectedFuncionarioIds.length === filteredFuncionarios.length && filteredFuncionarios.length > 0} /></TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Cargo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFuncionarios.length > 0 ? filteredFuncionarios.map(f => (
                                    <TableRow key={f.id} data-state={selectedFuncionarioIds.includes(f.id) && "selected"}>
                                        <TableCell><Checkbox checked={selectedFuncionarioIds.includes(f.id)} onCheckedChange={checked => setSelectedFuncionarioIds(prev => checked ? [...prev, f.id] : prev.filter(id => id !== f.id))} /></TableCell>
                                        <TableCell className="font-medium">{f.nome}</TableCell>
                                        <TableCell>{f.cargo}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="h-24 text-center">Nenhum funcionário encontrado.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className='flex justify-end'>
                    <Button onClick={handleCalcular} disabled={isLoading}>
                         {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Calculator className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Calculando...' : `Calcular ${tipoCalculo}`}
                    </Button>
                </CardFooter>
            </Card>

            {resultados.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Resultados do Cálculo</CardTitle>
                        <CardDescription>Resumo dos valores calculados para {resultados.length} funcionário(s).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Funcionário</TableHead>
                                        <TableHead className="text-right">13º Bruto</TableHead>
                                        <TableHead className="text-right">Adiantamento</TableHead>
                                        <TableHead className="text-right">INSS</TableHead>
                                        <TableHead className="text-right">IRRF</TableHead>
                                        <TableHead className="text-right">Líquido a Pagar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resultados.map(res => (
                                        <TableRow key={res.funcionarioId}>
                                            <TableCell className="font-medium">{res.nome}</TableCell>
                                            <TableCell className="text-right font-mono">{res.valorBruto13.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                            <TableCell className="text-right font-mono text-destructive">
                                                {res.adiantamento > 0 ? `(${res.adiantamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-destructive">
                                                {res.valorINSS > 0 ? `(${res.valorINSS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-destructive">
                                                 {res.valorIRRF > 0 ? `(${res.valorIRRF.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-bold text-primary">{res.liquidoAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-end'>
                         <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" /> Gerar Recibos (PDF)
                        </Button>
                    </CardFooter>
                 </Card>
            )}
        </div>
    );
}
    