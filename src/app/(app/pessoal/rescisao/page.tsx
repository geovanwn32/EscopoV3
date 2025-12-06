
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
import { Calculator, FileText, Loader2, ArrowLeft, CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { format, differenceInMonths, differenceInDays, addYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

interface ResultadoRescisao {
    funcionarioId: string;
    nome: string;
    verbasRescisorias: { descricao: string; valor: number }[];
    deducoes: { descricao: string; valor: number }[];
    totalVerbas: number;
    totalDeducoes: number;
    totalLiquido: number;
    bases: { baseFGTS: number, valorFGTS: number, baseINSS: number, baseIRRF: number };
}

export default function RescisaoPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [funcionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string | undefined>(undefined);
    const [dataRescisao, setDataRescisao] = useState<Date | undefined>(new Date());
    const [motivo, setMotivo] = useState<string>('demissao_sem_justa_causa');
    const [avisoPrevio, setAvisoPrevio] = useState<string>('indenizado');
    const [feriasVencidas, setFeriasVencidas] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [resultado, setResultado] = useState<ResultadoRescisao | null>(null);
    
    const selectedFuncionario = useMemo(() => {
        return funcionarios.find(f => f.id === selectedFuncionarioId);
    }, [funcionarios, selectedFuncionarioId]);

    const handleCalcular = () => {
        if (!selectedFuncionario || !dataRescisao) {
            toast({ variant: 'destructive', title: 'Dados Incompletos', description: 'Selecione um funcionário e a data da rescisão.' });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const verbasRescisorias: { descricao: string; valor: number }[] = [];
            const deducoes: { descricao: string; valor: number }[] = [];
            
            const salarioDia = selectedFuncionario.salario / 30;
            
            // 1. Saldo de Salário
            const diasTrabalhadosMes = dataRescisao.getDate();
            const saldoSalario = salarioDia * diasTrabalhadosMes;
            verbasRescisorias.push({ descricao: `Saldo de Salário (${diasTrabalhadosMes} dias)`, valor: saldoSalario });

            // 2. Aviso Prévio
            if (motivo === 'demissao_sem_justa_causa' && avisoPrevio === 'indenizado') {
                verbasRescisorias.push({ descricao: 'Aviso Prévio Indenizado', valor: selectedFuncionario.salario });
            }

            // 3. Férias
            if (feriasVencidas) {
                const feriasVencidasValor = selectedFuncionario.salario;
                const umTercoFeriasVencidas = feriasVencidasValor / 3;
                verbasRescisorias.push({ descricao: 'Férias Vencidas', valor: feriasVencidasValor });
                verbasRescisorias.push({ descricao: '1/3 sobre Férias Vencidas', valor: umTercoFeriasVencidas });
            }

            const mesesTrabalhadosPeriodoAquisitivo = (differenceInMonths(dataRescisao, new Date(selectedFuncionario.dataAdmissao)) % 12) + 1;
            const feriasProporcionais = (selectedFuncionario.salario / 12) * mesesTrabalhadosPeriodoAquisitivo;
            const umTercoFeriasProporcionais = feriasProporcionais / 3;
            verbasRescisorias.push({ descricao: `Férias Proporcionais (${mesesTrabalhadosPeriodoAquisitivo}/12)`, valor: feriasProporcionais });
            verbasRescisorias.push({ descricao: '1/3 sobre Férias Proporcionais', valor: umTercoFeriasProporcionais });

            // 4. 13º Salário
            const mesesTrabalhadosAno = dataRescisao.getMonth() + 1;
            const decimoTerceiroProporcional = (selectedFuncionario.salario / 12) * mesesTrabalhadosAno;
            verbasRescisorias.push({ descricao: `13º Salário Proporcional (${mesesTrabalhadosAno}/12)`, valor: decimoTerceiroProporcional });

            // Cálculos de Descontos
            const baseINSS = saldoSalario + decimoTerceiroProporcional; // Simplificado
            const valorINSS = getContribuicaoINSS(baseINSS);
            deducoes.push({ descricao: 'INSS sobre Verbas Rescisórias', valor: valorINSS });

            const baseIRRF = verbasRescisorias.reduce((acc, v) => acc + v.valor, 0) - valorINSS;
            const valorIRRF = getContribuicaoIRRF(baseIRRF, selectedFuncionario.dependente_count || 0);
             if (valorIRRF > 0) {
                deducoes.push({ descricao: 'IRRF na Fonte', valor: valorIRRF });
            }


            const totalVerbas = verbasRescisorias.reduce((sum, item) => sum + item.valor, 0);
            const totalDeducoes = deducoes.reduce((sum, item) => sum + item.valor, 0);

            // FGTS (não entra no líquido, mas é informativo)
            const baseFGTS = saldoSalario + decimoTerceiroProporcional + (avisoPrevio === 'indenizado' ? selectedFuncionario.salario : 0);
            const valorFGTS = baseFGTS * 0.08;

            setResultado({
                funcionarioId: selectedFuncionario.id,
                nome: selectedFuncionario.nome,
                verbasRescisorias,
                deducoes,
                totalVerbas,
                totalDeducoes,
                totalLiquido: totalVerbas - totalDeducoes,
                bases: { baseFGTS, valorFGTS, baseINSS, baseIRRF }
            });

            setIsLoading(false);
            toast({ title: 'Cálculo Realizado!', description: 'A rescisão foi calculada com sucesso.' });
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cálculo de Rescisão</h1>
                    <p className="text-muted-foreground">Calcule o Termo de Rescisão de Contrato de Trabalho (TRCT).</p>
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Dados para o Cálculo da Rescisão</CardTitle>
                    <CardDescription>Selecione o funcionário e os detalhes do desligamento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="funcionario">Funcionário</Label>
                            <Select value={selectedFuncionarioId} onValueChange={setSelectedFuncionarioId}>
                                <SelectTrigger id="funcionario"><SelectValue placeholder="Selecione um funcionário..." /></SelectTrigger>
                                <SelectContent>
                                    {funcionarios.length > 0 ? funcionarios.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>) : <div className='p-4 text-sm text-muted-foreground'>Nenhum funcionário cadastrado.</div>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataRescisao">Data da Rescisão</Label>
                             <Popover>
                                <PopoverTrigger asChild><Button id="dataRescisao" variant="outline" className={cn("w-full justify-start text-left font-normal", !dataRescisao && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dataRescisao ? format(dataRescisao, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}</Button></PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataRescisao} onSelect={setDataRescisao} initialFocus locale={ptBR}/></PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="motivo">Motivo da Rescisão</Label>
                            <Select value={motivo} onValueChange={setMotivo}>
                                <SelectTrigger id="motivo"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="demissao_sem_justa_causa">Demissão sem Justa Causa</SelectItem>
                                    <SelectItem value="pedido_demissao">Pedido de Demissão</SelectItem>
                                    <SelectItem value="termino_contrato">Término de Contrato de Experiência</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avisoPrevio">Aviso Prévio</Label>
                            <Select value={avisoPrevio} onValueChange={setAvisoPrevio}>
                                <SelectTrigger id="avisoPrevio"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="indenizado">Indenizado</SelectItem>
                                    <SelectItem value="trabalhado">Trabalhado</SelectItem>
                                    <SelectItem value="dispensado">Dispensado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                     </div>
                     <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="feriasVencidas" checked={feriasVencidas} onCheckedChange={(checked) => setFeriasVencidas(!!checked)}/>
                        <Label htmlFor="feriasVencidas">Possui Férias Vencidas não gozadas?</Label>
                     </div>
                </CardContent>
                <CardFooter className='flex justify-end'>
                    <Button onClick={handleCalcular} disabled={isLoading}>
                         {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Calculator className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Calculando...' : 'Calcular Rescisão'}
                    </Button>
                </CardFooter>
            </Card>

            {resultado && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Resultado da Rescisão</CardTitle>
                        <CardDescription>Demonstrativo de valores para {resultado.nome}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-primary">Verbas Rescisórias (Proventos)</h4>
                                <div className="flow-root rounded-md border px-4 py-2"><dl className="-my-2 divide-y divide-border">{resultado.verbasRescisorias.map(v => (<div key={v.descricao} className="flex items-center justify-between py-2"><dt className="text-muted-foreground">{v.descricao}</dt><dd className="font-medium font-mono">+{v.valor.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>))}</dl></div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-destructive">Deduções</h4>
                                <div className="flow-root rounded-md border px-4 py-2"><dl className="-my-2 divide-y divide-border">{resultado.deducoes.map(d => (<div key={d.descricao} className="flex items-center justify-between py-2"><dt className="text-muted-foreground">{d.descricao}</dt><dd className="font-medium font-mono text-destructive">-{d.valor.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>))}</dl></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t pt-4">
                             <div className="space-y-1"><dt className="text-xs text-muted-foreground">Total Verbas</dt><dd className="font-semibold text-emerald-600">{resultado.totalVerbas.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                             <div className="space-y-1"><dt className="text-xs text-muted-foreground">Total Deduções</dt><dd className="font-semibold text-destructive">{resultado.totalDeducoes.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                             <div className="space-y-1 col-span-2 md:col-span-1"><dt className="text-xs text-muted-foreground">FGTS do Mês + Multa</dt><dd className="font-semibold">{(resultado.bases.valorFGTS + (motivo === 'demissao_sem_justa_causa' ? resultado.bases.baseFGTS * 0.4 : 0)).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                             <div className="space-y-1 col-span-2 md:col-span-1"><dt className="text-sm font-bold">Líquido a Receber</dt><dd className="text-xl font-bold text-primary">{resultado.totalLiquido.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Gerar TRCT (PDF)</Button>
                    </CardFooter>
                 </Card>
            )}
        </div>
    );
  }

    