
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface ResultadoFerias {
    funcionarioId: string;
    nome: string;
    proventos: { descricao: string; valor: number }[];
    descontos: { descricao: string; valor: number }[];
    totalBruto: number;
    totalDescontos: number;
    totalLiquido: number;
}


export default function FeriasPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [funcionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string | undefined>(undefined);
    const [dataInicio, setDataInicio] = useState<Date | undefined>(new Date());
    const [diasFerias, setDiasFerias] = useState<number>(30);
    const [venderFerias, setVenderFerias] = useState(false);
    const [adiantar13, setAdiantar13] = useState(false);


    const [isLoading, setIsLoading] = useState(false);
    const [resultado, setResultado] = useState<ResultadoFerias | null>(null);
    
    const selectedFuncionario = useMemo(() => {
        return funcionarios.find(f => f.id === selectedFuncionarioId);
    }, [funcionarios, selectedFuncionarioId]);

    const handleCalcular = () => {
        if (!selectedFuncionario || !dataInicio) {
            toast({ variant: 'destructive', title: 'Dados Incompletos', description: 'Selecione um funcionário e a data de início das férias.' });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const proventos: { descricao: string; valor: number }[] = [];
            const descontos: { descricao: string; valor: number }[] = [];

            const salario = selectedFuncionario.salario;
            const diasAbono = venderFerias ? Math.floor(diasFerias / 3) : 0;
            const diasGozo = diasFerias - diasAbono;

            // 1. Férias
            const valorFerias = (salario / 30) * diasGozo;
            proventos.push({ descricao: `Férias (${diasGozo} dias)`, valor: valorFerias });

            // 2. Terço Constitucional sobre as Férias
            const tercoFerias = valorFerias / 3;
            proventos.push({ descricao: '1/3 sobre Férias', valor: tercoFerias });

            // 3. Abono Pecuniário (Venda das Férias)
            let valorAbono = 0;
            let tercoAbono = 0;
            if (venderFerias && diasAbono > 0) {
                valorAbono = (salario / 30) * diasAbono;
                proventos.push({ descricao: `Abono Pecuniário (${diasAbono} dias)`, valor: valorAbono });
                tercoAbono = valorAbono / 3;
                proventos.push({ descricao: '1/3 sobre Abono Pecuniário', valor: tercoAbono });
            }
            
            // 4. Adiantamento 13º Salário
            let adiantamento13Valor = 0;
            if (adiantar13) {
                adiantamento13Valor = salario / 2;
                proventos.push({ descricao: 'Adiantamento 13º Salário', valor: adiantamento13Valor });
            }

            // --- CÁLCULO DE DESCONTOS ---
            const baseINSS = valorFerias + tercoFerias;
            const valorINSS = getContribuicaoINSS(baseINSS);
            descontos.push({ descricao: 'INSS sobre Férias', valor: valorINSS });

            const baseIRRF = (valorFerias + tercoFerias) - valorINSS;
            const valorIRRF = getContribuicaoIRRF(baseIRRF, selectedFuncionario.dependentes?.length || 0);
            if (valorIRRF > 0) {
                 descontos.push({ descricao: 'IRRF sobre Férias', valor: valorIRRF });
            }
            
            // --- TOTAIS ---
            const totalBruto = proventos.reduce((acc, p) => acc + p.valor, 0);
            const totalDescontos = descontos.reduce((acc, d) => acc + d.valor, 0);

            setResultado({
                funcionarioId: selectedFuncionario.id,
                nome: selectedFuncionario.nome,
                proventos,
                descontos,
                totalBruto,
                totalDescontos,
                totalLiquido: totalBruto - totalDescontos,
            });

            setIsLoading(false);
            toast({ title: 'Cálculo Realizado!', description: 'As férias foram calculadas com sucesso.' });
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Cálculo de Férias</h1>
                    <p className="text-muted-foreground">Calcule férias, abono pecuniário e adiantamento de 13º salário.</p>
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Dados para o Cálculo</CardTitle>
                    <CardDescription>Selecione o funcionário e os detalhes para o cálculo das férias.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <Label htmlFor="dataInicio">Data de Início das Férias</Label>
                             <Popover>
                                <PopoverTrigger asChild><Button id="dataInicio" variant="outline" className={cn("w-full justify-start text-left font-normal", !dataInicio && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}</Button></PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus locale={ptBR}/></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diasFerias">Dias de Férias</Label>
                            <Input id="diasFerias" type="number" value={diasFerias} onChange={(e) => setDiasFerias(parseInt(e.target.value) || 30)} min={1} max={30} />
                        </div>
                    </div>
                     <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="venderFerias" checked={venderFerias} onCheckedChange={(checked) => setVenderFerias(!!checked)}/>
                            <Label htmlFor="venderFerias" className="cursor-pointer">Vender 1/3 das férias (Abono Pecuniário)</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="adiantar13" checked={adiantar13} onCheckedChange={(checked) => setAdiantar13(!!checked)}/>
                            <Label htmlFor="adiantar13" className="cursor-pointer">Adiantar 1ª parcela do 13º Salário</Label>
                        </div>
                     </div>
                </CardContent>
                <CardFooter className='flex justify-end'>
                    <Button onClick={handleCalcular} disabled={isLoading}>
                         {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Calculator className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Calculando...' : 'Calcular Férias'}
                    </Button>
                </CardFooter>
            </Card>

            {resultado && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Recibo de Férias</CardTitle>
                        <CardDescription>Demonstrativo de valores para {resultado.nome}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                             <div className="space-y-2">
                                <h4 className="font-semibold text-primary">Proventos</h4>
                                <div className="flow-root rounded-md border px-4 py-2"><dl className="-my-2 divide-y divide-border">{resultado.proventos.map(v => (<div key={v.descricao} className="flex items-center justify-between py-2"><dt className="text-muted-foreground">{v.descricao}</dt><dd className="font-medium font-mono">+{v.valor.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>))}</dl></div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-destructive">Descontos</h4>
                                <div className="flow-root rounded-md border px-4 py-2"><dl className="-my-2 divide-y divide-border">{resultado.descontos.map(d => (<div key={d.descricao} className="flex items-center justify-between py-2"><dt className="text-muted-foreground">{d.descricao}</dt><dd className="font-medium font-mono text-destructive">-{d.valor.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>))}</dl></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                             <div className="space-y-1"><dt className="text-xs text-muted-foreground">Total Bruto</dt><dd className="font-semibold text-emerald-600">{resultado.totalBruto.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                             <div className="space-y-1"><dt className="text-xs text-muted-foreground">Total Descontos</dt><dd className="font-semibold text-destructive">{resultado.totalDescontos.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                             <div className="space-y-1"><dt className="text-sm font-bold">Líquido a Receber</dt><dd className="text-xl font-bold text-primary">{resultado.totalLiquido.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                        </div>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
  }
