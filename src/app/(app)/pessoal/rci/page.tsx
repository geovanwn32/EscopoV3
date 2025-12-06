

'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '@/hooks/use-company';
import { useToast } from '@/hooks/use-toast';
import { Calculator, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { MoneyInput } from '@/components/ui/money-input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Simplified Socio interface for this context
interface Socio {
    id: number;
    nome: string;
    cpf: string;
    cargo: string;
}

interface ResultadoRCI {
    socioId: number;
    socioNome: string;
    bruto: number;
    baseINSS: number;
    valorINSS: number;
    baseIRRF: number;
    valorIRRF: number;
    liquido: number;
    mes: number;
    ano: number;
}

const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, 'label': 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, 'label': 'Outubro' }, { value: 11, 'label': 'Novembro' }, { value: 12, 'label': 'Dezembro' }
];

const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

// --- FUNÇÕES DE CÁLCULO DE IMPOSTOS ---

// Tabela INSS (Exemplo 2024 - Alíquota de 11% sobre o valor, limitado ao teto)
const getContribuicaoINSSProLabore = (baseCalculo: number) => {
    const tetoINSS = 7786.02;
    const baseConsiderada = Math.min(baseCalculo, tetoINSS);
    return baseConsiderada * 0.11;
};

// Tabela IRRF (Exemplo 2024 - substitua se necessário)
const getContribuicaoIRRF = (baseCalculo: number) => {
    if (baseCalculo <= 2259.20) return 0;
    if (baseCalculo <= 2826.65) return (baseCalculo * 0.075) - 169.44;
    if (baseCalculo <= 3751.05) return (baseCalculo * 0.15) - 381.44;
    if (baseCalculo <= 4664.68) return (baseCalculo * 0.225) - 662.77;
    return (baseCalculo * 0.275) - 896.00;
};


export default function RciPage() {
    const { toast } = useToast();
    const { useScopedData, companies, currentCompany } = useCompany();
    const [socios] = useScopedData<Socio[]>('cadastros-socios', []);
    const [resultados, setResultados] = useScopedData<ResultadoRCI[]>('pessoal-rci-resultados', []);


    const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
    const [ano, setAno] = useState<number>(new Date().getFullYear());
    
    const [socioValores, setSocioValores] = useState<Record<number, number>>({});
    const [activeResultado, setActiveResultado] = useState<ResultadoRCI | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    
    const activeCompany = useMemo(() => companies.find(c => c.id === currentCompany), [companies, currentCompany]);

    const handleValorChange = (socioId: number, valor: number) => {
        setSocioValores(prev => ({ ...prev, [socioId]: valor }));
    }

    const handleCalcular = () => {
        const sociosParaCalcular = Object.entries(socioValores).filter(([, valor]) => valor > 0);
        if (sociosParaCalcular.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum valor informado', description: 'Informe o valor do pró-labore para pelo menos um sócio.' });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const novosResultados = sociosParaCalcular.map(([socioIdStr, valorBruto]) => {
                const socioId = Number(socioIdStr);
                const socio = socios.find(s => s.id === socioId);
                if (!socio) return null;

                const baseINSS = valorBruto;
                const valorINSS = getContribuicaoINSSProLabore(baseINSS);
                const baseIRRF = valorBruto - valorINSS;
                const valorIRRF = getContribuicaoIRRF(baseIRRF);
                const totalDescontos = valorINSS + valorIRRF;
                const liquido = valorBruto - totalDescontos;

                return {
                    socioId,
                    socioNome: socio.nome,
                    bruto: valorBruto,
                    baseINSS,
                    valorINSS,
                    baseIRRF,
                    valorIRRF,
                    liquido,
                    mes,
                    ano,
                };
            }).filter((r): r is ResultadoRCI => r !== null);
            
            setResultados(prev => [...prev, ...novosResultados]);
            setActiveResultado(novosResultados[0] || null); // Show first result
            setIsLoading(false);
            toast({ title: 'Cálculo Realizado!', description: `${novosResultados.length} pró-labore(s) calculado(s) com sucesso.` });
        }, 500);
    };
    
    const gerarReciboPDF = (resultado: ResultadoRCI) => {
        const socio = socios.find(s => s.id === resultado.socioId);
        if (!socio) {
             toast({ variant: 'destructive', title: 'Sócio não encontrado.' });
            return;
        }

        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Recibo de Pagamento de Pró-Labore', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Competência: ${meses.find(m => m.value === resultado.mes)?.label}/${resultado.ano}`, 105, 28, { align: 'center' });
        
        // Dados da Empresa e Sócio
        autoTable(doc, {
            body: [
                [{ content: 'EMPRESA', styles: { fontStyle: 'bold' } }, { content: 'SÓCIO', styles: { fontStyle: 'bold' } }],
                [`Nome: ${activeCompany?.name || 'N/D'}\nCNPJ: ${activeCompany?.data?.cnpj || 'N/D'}`, `Nome: ${socio.nome}\nCPF: ${socio.cpf}`],
            ],
            startY: 35,
            theme: 'grid',
            styles: { cellPadding: 2, fontSize: 9, overflow: 'linebreak' }
        });
        
        const finalY = (doc as any).lastAutoTable.finalY;

        // Tabela de Valores
        autoTable(doc, {
            head: [['Descrição', 'Proventos (R$)', 'Descontos (R$)']],
            body: [
                ['Pró-labore (Valor Bruto)', resultado.bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), ''],
                ['INSS (11%)', '', resultado.valorINSS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })],
                ['IRRF', '', resultado.valorIRRF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })],
            ],
            startY: finalY + 10,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] },
            columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'right' }
            }
        });
        
        const totalY = (doc as any).lastAutoTable.finalY;
        
        // Totais
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Total de Proventos:', 14, totalY + 10);
        doc.text(resultado.bruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 100, totalY + 10, { align: 'right' });
        doc.text('Total de Descontos:', 110, totalY + 10);
        doc.text((resultado.valorINSS + resultado.valorIRRF).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 196, totalY + 10, { align: 'right' });

        doc.setLineWidth(0.5);
        doc.line(14, totalY + 13, 196, totalY + 13);
        
        doc.setFontSize(14);
        doc.text('VALOR LÍQUIDO:', 14, totalY + 20);
        doc.text(resultado.liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 196, totalY + 20, { align: 'right' });
        
        // Assinatura
        const signatureY = totalY + 50;
        doc.setLineWidth(0.2);
        doc.line(40, signatureY, 170, signatureY);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(socio.nome, 105, signatureY + 5, { align: 'center' });
        doc.text('Assinatura do Sócio', 105, signatureY + 10, { align: 'center' });

        doc.save(`Recibo_ProLabore_${socio.nome.split(' ')[0]}_${resultado.mes}_${resultado.ano}.pdf`);
        toast({ title: "Recibo Gerado!", description: "O arquivo PDF com o recibo foi baixado." });
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">RCI (Pró-labore)</h1>
                    <p className="text-muted-foreground">Calcule o pró-labore dos sócios da empresa.</p>
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>1. Seleção de Competência e Sócios</CardTitle>
                    <CardDescription>Escolha o período, os sócios e defina o valor do pró-labore para cada um.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mes">Mês</Label>
                            <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}><SelectTrigger id="mes"><SelectValue /></SelectTrigger><SelectContent>{meses.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ano">Ano</Label>
                            <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}><SelectTrigger id="ano"><SelectValue /></SelectTrigger><SelectContent>{anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent></Select>
                        </div>
                    </div>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome do Sócio</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead className="w-[250px]">Valor do Pró-labore</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {socios.length > 0 ? socios.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.nome}</TableCell>
                                        <TableCell>{s.cargo}</TableCell>
                                        <TableCell>
                                            <MoneyInput id={`valor-${s.id}`} value={socioValores[s.id] || 0} onValueChange={(v) => handleValorChange(s.id, v)} />
                                        </TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="text-center h-24">Nenhum sócio cadastrado</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleCalcular} disabled={isLoading}>
                        {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Calculator className="mr-2 h-4 w-4" />}
                        Calcular Pró-labore
                    </Button>
                </CardFooter>
            </Card>
                
            {resultados.length > 0 && (
                <Card>
                <CardHeader>
                    <CardTitle>2. Resultados dos Cálculos</CardTitle>
                    <CardDescription>Resumo dos cálculos de pró-labore realizados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Sócio</TableHead>
                            <TableHead>Competência</TableHead>
                            <TableHead className="text-right">Valor Bruto</TableHead>
                            <TableHead className="text-right">INSS</TableHead>
                            <TableHead className="text-right">IRRF</TableHead>
                            <TableHead className="text-right">Valor Líquido</TableHead>
                            <TableHead className="w-[120px] text-center">Ações</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resultados.map(res => (
                                <TableRow key={`${res.socioId}-${res.mes}-${res.ano}`}>
                                <TableCell className="font-medium">{res.socioNome}</TableCell>
                                <TableCell>{String(res.mes).padStart(2, '0')}/{res.ano}</TableCell>
                                <TableCell className="text-right font-mono">{res.bruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                <TableCell className="text-right font-mono text-red-500">{res.valorINSS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                <TableCell className="text-right font-mono text-red-500">{res.valorIRRF.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                <TableCell className="text-right font-mono text-emerald-600 font-bold">{res.liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                <TableCell className="text-center">
                                    <Button variant="outline" size="sm" onClick={() => gerarReciboPDF(res)}>
                                        <FileText className="mr-2 h-4 w-4" /> Recibo
                                    </Button>
                                </TableCell>
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

    
