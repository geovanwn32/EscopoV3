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
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

interface ResultadoFerias {
    funcionarioId: string;
    nome: string;
    salarioBruto: number;
    diasFerias: number;
    diasAbono: number;
    valorFeriasBruto: number;
    valorUmTerco: number;
    valorAbono: number;
    valorUmTercoAbono: number;
    valorAdiantamento13: number;
    totalProventos: number;
    baseINSS: number;
    valorINSS: number;
    baseIRRF: number;
    valorIRRF: number;
    totalDescontos: number;
    liquidoFerias: number;
}


export default function FeriasPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [funcionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string | undefined>(undefined);
    const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
    const [diasFerias, setDiasFerias] = useState(30);
    const [venderUmTerco, setVenderUmTerco] = useState(false);
    const [adiantar13, setAdiantar13] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [resultado, setResultado] = useState<ResultadoFerias | null>(null);

    const handleCalcular = () => {
        const funcionario = funcionarios.find(f => f.id === selectedFuncionarioId);
        if (!funcionario || !dataInicio) {
            toast({ variant: 'destructive', title: 'Dados Incompletos', description: 'Selecione um funcionário e a data de início das férias.' });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const diasAbono = venderUmTerco ? Math.floor(diasFerias / 3) : 0;
            const diasGozo = diasFerias - diasAbono;

            const salarioDia = funcionario.salario / 30;

            const valorFeriasBruto = salarioDia * diasGozo;
            const valorUmTerco = valorFeriasBruto / 3;
            const valorAbono = salarioDia * diasAbono;
            const valorUmTercoAbono = valorAbono / 3;

            const valorAdiantamento13 = adiantar13 ? funcionario.salario / 2 : 0;

            const totalProventos = valorFeriasBruto + valorUmTerco + valorAbono + valorUmTercoAbono + valorAdiantamento13;

            const baseINSS = valorFeriasBruto + valorUmTerco;
            const valorINSS = getContribuicaoINSS(baseINSS);

            const numDependentes = funcionario.dependentes?.length || 0;
            const baseIRRF = baseINSS - valorINSS;
            const valorIRRF = getContribuicaoIRRF(baseIRRF, numDependentes);

            const totalDescontos = valorINSS + valorIRRF;
            const liquidoFerias = totalProventos - totalDescontos;

            setResultado({
                funcionarioId: funcionario.id,
                nome: funcionario.nome,
                salarioBruto: funcionario.salario,
                diasFerias: diasGozo,
                diasAbono,
                valorFeriasBruto,
                valorUmTerco,
                valorAbono,
                valorUmTercoAbono,
                valorAdiantamento13,
                totalProventos,
                baseINSS,
                valorINSS,
                baseIRRF,
                valorIRRF,
                totalDescontos,
                liquidoFerias,
            });

            setIsLoading(false);
            toast({ title: 'Cálculo Realizado!', description: 'O cálculo das férias foi concluído com sucesso.' });
        }, 500);
    };

    const gerarReciboPDF = () => {
        if (!resultado) return;
        const funcionario = funcionarios.find(f => f.id === resultado.funcionarioId);
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("Recibo de Férias", 105, 20, { align: 'center' });
        
        autoTable(doc, {
            body: [
                ['Funcionário(a):', funcionario?.nome || ''],
                ['Período de Gozo:', `${format(dataInicio!, 'dd/MM/yyyy')} a ${format(new Date(dataInicio!.getTime() + (resultado.diasFerias - 1) * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}`],
                ['Dias de Férias:', `${resultado.diasFerias} dias`],
                ...(resultado.diasAbono > 0 ? [['Abono Pecuniário:', `${resultado.diasAbono} dias`]] : []),
            ],
            startY: 30,
            theme: 'plain',
            styles: { fontSize: 10 }
        });

        const finalY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
            head: [['Descrição', 'Proventos (R$)', 'Descontos (R$)']],
            body: [
                ['Férias', resultado.valorFeriasBruto.toFixed(2), ''],
                ['1/3 Constitucional s/ Férias', resultado.valorUmTerco.toFixed(2), ''],
                ...(resultado.valorAbono > 0 ? [['Abono Pecuniário', resultado.valorAbono.toFixed(2), '']] : []),
                ...(resultado.valorUmTercoAbono > 0 ? [['1/3 s/ Abono Pecuniário', resultado.valorUmTercoAbono.toFixed(2), '']] : []),
                ...(resultado.valorAdiantamento13 > 0 ? [['Adiant. 13º Salário', resultado.valorAdiantamento13.toFixed(2), '']] : []),
                ['INSS sobre Férias', '', resultado.valorINSS.toFixed(2)],
                ['IRRF sobre Férias', '', resultado.valorIRRF.toFixed(2)],
            ],
            startY: finalY + 5,
            theme: 'striped',
            headStyles: { fillColor: [40, 40, 40] }
        });

        const totalY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
            body: [
                ['Totais', `${resultado.totalProventos.toFixed(2)}`, `${resultado.totalDescontos.toFixed(2)}`],
                ['Líquido a Receber', { content: `${resultado.liquidoFerias.toFixed(2)}`, colSpan: 2, styles: { fontStyle: 'bold' } }]
            ],
            startY: totalY,
            theme: 'grid',
        });
        
        doc.save(`Recibo_Ferias_${resultado.nome.replace(' ', '_')}.pdf`);
        toast({ title: "Recibo Gerado", description: "O PDF do recibo de férias foi baixado." });
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
                    <p className="text-muted-foreground">Calcule férias, abono e adiantamento de 13º.</p>
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Dados para o Cálculo</CardTitle>
                    <CardDescription>Selecione o funcionário e preencha as informações para calcular as férias.</CardDescription>
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
                            <Label htmlFor="dataInicio">Data de Início das Férias</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="dataInicio" variant="outline" className={cn("w-full justify-start text-left font-normal", !dataInicio && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus locale={ptBR}/></PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dias">Quantidade de Dias</Label>
                            <Input id="dias" type="number" value={diasFerias} onChange={e => setDiasFerias(parseInt(e.target.value))} min={1} max={30} />
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-6 pt-4">
                        <div className="flex items-center space-x-2"><Checkbox id="vender" checked={venderUmTerco} onCheckedChange={(checked) => setVenderUmTerco(!!checked)}/><Label htmlFor="vender">Vender 1/3 das férias (Abono Pecuniário)</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="adiantar13" checked={adiantar13} onCheckedChange={(checked) => setAdiantar13(!!checked)}/><Label htmlFor="adiantar13">Adiantar 1ª parcela do 13º</Label></div>
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
                        <CardTitle>Resultado do Cálculo de Férias</CardTitle>
                        <CardDescription>Resumo dos valores calculados para {resultado.nome}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {/* Proventos */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-primary">Proventos</h4>
                                <div className="flow-root rounded-md border px-4 py-2">
                                     <dl className="-my-2 divide-y divide-border">
                                        <div className="flex items-center justify-between py-2"><dt className="text-muted-foreground">Férias ({resultado.diasFerias} dias)</dt><dd className="font-medium font-mono">+{resultado.valorFeriasBruto.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                                        <div className="flex items-center justify-between py-2"><dt className="text-muted-foreground">1/3 sobre Férias</dt><dd className="font-medium font-mono">+{resultado.valorUmTerco.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                                        {resultado.valorAbono > 0 && <div className="flex items-center justify-between py-2"><dt className="text-muted-foreground">Abono ({resultado.diasAbono} dias)</dt><dd className="font-medium font-mono">+{resultado.valorAbono.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>}
                                        {resultado.valorUmTercoAbono > 0 && <div className="flex items-center justify-between py-2"><dt className="text-muted-foreground">1/3 sobre Abono</dt><dd className="font-medium font-mono">+{resultado.valorUmTercoAbono.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>}
                                        {resultado.valorAdiantamento13 > 0 && <div className="flex items-center justify-between py-2"><dt className="text-muted-foreground">Adiantamento 13º</dt><dd className="font-medium font-mono">+{resultado.valorAdiantamento13.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>}
                                         <div className="flex items-center justify-between py-3"><dt className="font-bold">Total Proventos</dt><dd className="font-bold font-mono text-emerald-600">{resultado.totalProventos.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                                    </dl>
                                </div>
                            </div>
                            {/* Descontos */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-destructive">Descontos</h4>
                                 <div className="flow-root rounded-md border px-4 py-2">
                                     <dl className="-my-2 divide-y divide-border">
                                        <div className="flex items-center justify-between py-2"><dt className="text-muted-foreground">INSS sobre Férias</dt><dd className="font-medium font-mono">-{resultado.valorINSS.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                                        <div className="flex items-center justify-between py-2"><dt className="text-muted-foreground">IRRF sobre Férias</dt><dd className="font-medium font-mono">-{resultado.valorIRRF.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                                        <div className="flex items-center justify-between py-3"><dt className="font-bold">Total Descontos</dt><dd className="font-bold font-mono text-destructive">{resultado.totalDescontos.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</dd></div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                            <span className="text-xl font-bold">Valor Líquido das Férias</span>
                            <span className="text-2xl font-bold font-mono text-primary">{resultado.liquidoFerias.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button variant="outline" onClick={gerarReciboPDF}>
                            <FileText className="mr-2 h-4 w-4" /> Gerar Recibo PDF
                        </Button>
                    </CardFooter>
                 </Card>
            )}
        </div>
    );
  }
  

    