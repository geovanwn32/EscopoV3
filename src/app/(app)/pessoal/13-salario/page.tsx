
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '@/hooks/use-company';
import type { Funcionario } from '@/types/pessoal';
import { useToast } from '@/hooks/use-toast';
import { Calculator, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

// --- FUNÇÕES DE CÁLCULO DE IMPOSTOS (Simplificadas) ---
const getContribuicaoINSS = (baseCalculo: number) => {
    if (baseCalculo <= 1412.00) return baseCalculo * 0.075;
    if (baseCalculo <= 2666.68) return (baseCalculo * 0.09) - 21.18;
    if (baseCalculo <= 4000.03) return (baseCalculo * 0.12) - 101.18;
    if (baseCalculo <= 7786.02) return (baseCalculo * 0.14) - 181.18;
    return 908.85; // Teto
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
    bruto: number;
    adiantamento: number;
    inss: number;
    irrf: number;
    liquido: number;
}

export default function DecimoTerceiroPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [funcionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    
    const [tipoCalculo, setTipoCalculo] = useState<'primeira' | 'segunda' | 'unica'>('segunda');
    const [ano, setAno] = useState(new Date().getFullYear());
    const [selectedFuncionarios, setSelectedFuncionarios] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [resultados, setResultados] = useState<Resultado13[] | null>(null);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedFuncionarios(funcionarios.map(f => f.id));
        } else {
            setSelectedFuncionarios([]);
        }
    };
    
    const handleCalcular = () => {
        if (selectedFuncionarios.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum funcionário selecionado', description: 'Selecione pelo menos um funcionário para o cálculo.' });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const calculos = selectedFuncionarios.map(id => {
                const funcionario = funcionarios.find(f => f.id === id);
                if (!funcionario) return null;

                const salario = funcionario.salario;
                let bruto = salario; // Simplificado - considerar meses trabalhados
                let adiantamento = 0;
                let inss = 0;
                let irrf = 0;
                let liquido = 0;

                switch (tipoCalculo) {
                    case 'primeira':
                        liquido = bruto / 2;
                        break;
                    case 'segunda':
                        adiantamento = bruto / 2;
                        inss = getContribuicaoINSS(bruto);
                        irrf = getContribuicaoIRRF(bruto - inss, funcionario.dependentes?.length || 0);
                        liquido = bruto - adiantamento - inss - irrf;
                        break;
                    case 'unica':
                        inss = getContribuicaoINSS(bruto);
                        irrf = getContribuicaoIRRF(bruto - inss, funcionario.dependentes?.length || 0);
                        liquido = bruto - inss - irrf;
                        break;
                }
                
                return {
                    funcionarioId: funcionario.id,
                    nome: funcionario.nome,
                    bruto,
                    adiantamento,
                    inss,
                    irrf,
                    liquido: Math.max(0, liquido),
                };

            }).filter((r): r is Resultado13 => r !== null);

            setResultados(calculos);
            setIsLoading(false);
            toast({ title: 'Cálculo Realizado!', description: `13º Salário calculado para ${calculos.length} funcionário(s).` });
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
                    <p className="text-muted-foreground">Calcule a 1ª, 2ª ou parcela única do 13º salário dos seus funcionários.</p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Dados para o Cálculo</CardTitle>
                    <CardDescription>Selecione o tipo de cálculo, ano e os funcionários.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tipoCalculo">Tipo de Cálculo</Label>
                            <Select value={tipoCalculo} onValueChange={(v) => setTipoCalculo(v as any)}>
                                <SelectTrigger id="tipoCalculo"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="primeira">1ª Parcela (Adiantamento)</SelectItem>
                                    <SelectItem value="segunda">2ª Parcela (Quitação)</SelectItem>
                                    <SelectItem value="unica">Parcela Única</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="ano">Ano</Label>
                            <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
                                <SelectTrigger id="ano"><SelectValue /></SelectTrigger>
                                <SelectContent>{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"><Checkbox onCheckedChange={handleSelectAll} checked={selectedFuncionarios.length === funcionarios.length && funcionarios.length > 0} /></TableHead>
                                    <TableHead>Funcionário</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead className="text-right">Salário Base</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {funcionarios.length > 0 ? funcionarios.map(f => (
                                     <TableRow key={f.id} data-state={selectedFuncionarios.includes(f.id) && "selected"}>
                                        <TableCell><Checkbox checked={selectedFuncionarios.includes(f.id)} onCheckedChange={(checked) => setSelectedFuncionarios(prev => checked ? [...prev, f.id] : prev.filter(id => id !== f.id))} /></TableCell>
                                        <TableCell className="font-medium">{f.nome}</TableCell>
                                        <TableCell>{f.cargo}</TableCell>
                                        <TableCell className="text-right font-mono">{f.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum funcionário cadastrado.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="justify-between">
                     <p className='text-sm text-muted-foreground'>{selectedFuncionarios.length} funcionário(s) selecionado(s)</p>
                    <Button onClick={handleCalcular} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Calculando...' : 'Calcular'}
                    </Button>
                </CardFooter>
            </Card>

            {resultados && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Resultados do Cálculo</CardTitle>
                        <CardDescription>Demonstrativo dos valores para os funcionários selecionados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Funcionário</TableHead>
                                        <TableHead className="text-right">Bruto</TableHead>
                                        <TableHead className="text-right">Adiantamento</TableHead>
                                        <TableHead className="text-right">INSS</TableHead>
                                        <TableHead className="text-right">IRRF</TableHead>
                                        <TableHead className="text-right font-bold">Líquido a Pagar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resultados.map(r => (
                                        <TableRow key={r.funcionarioId}>
                                            <TableCell className="font-medium">{r.nome}</TableCell>
                                            <TableCell className="text-right font-mono">{r.bruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                            <TableCell className="text-right font-mono text-amber-600">{r.adiantamento > 0 ? `-${r.adiantamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '-'}</TableCell>
                                            <TableCell className="text-right font-mono text-red-500">{r.inss > 0 ? `-${r.inss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '-'}</TableCell>
                                            <TableCell className="text-right font-mono text-red-500">{r.irrf > 0 ? `-${r.irrf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '-'}</TableCell>
                                            <TableCell className="text-right font-mono font-bold text-emerald-600">{r.liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
