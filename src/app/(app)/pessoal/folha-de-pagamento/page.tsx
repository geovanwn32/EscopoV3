
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
import { Calculator, Plus, Trash2, Loader2, FileText, BookCopy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Rubrica {
  id: number;
  codigo: string;
  descricao: string;
  tipo: 'Provento' | 'Desconto';
}

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
}


const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);


const rubricasPadrao: Rubrica[] = [
    { id: 1, codigo: '101', descricao: 'Salário Base', tipo: 'Provento' },
    { id: 2, codigo: '102', descricao: 'Horas Extras 50%', tipo: 'Provento' },
    { id: 3, codigo: '103', descricao: 'Comissões', tipo: 'Provento' },
    { id: 4, codigo: '201', descricao: 'INSS', tipo: 'Desconto' },
    { id: 5, codigo: '202', descricao: 'IRRF', tipo: 'Desconto' },
    { id: 6, codigo: '203', descricao: 'Faltas (dias)', tipo: 'Desconto' },
    { id: 7, codigo: '204', descricao: 'Adiantamento Salarial', tipo: 'Desconto' },
];

export default function FolhaDePagamentoPage() {
    const { toast } = useToast();
    const { useScopedData } = useCompany();
    const [funcionarios] = useScopedData<Funcionario[]>('cadastros-funcionarios', []);
    
    const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
    const [ano, setAno] = useState<number>(new Date().getFullYear());
    const [selectedFuncionarios, setSelectedFuncionarios] = useState<number[]>([]);
    const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
    const [resultados, setResultados] = useState<ResultadoFolha[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedFuncionarios(funcionarios.map(f => f.id));
        } else {
            setSelectedFuncionarios([]);
        }
    };
    
    const handleAddLancamento = (rubricaId: number, tipo: 'coletivo' | 'individual', funcionarioId?: number) => {
        if (!rubricaId) return;
        
        const newLancamentos: Lancamento[] = [];
        const targetFuncionarios = tipo === 'coletivo' ? selectedFuncionarios : (funcionarioId ? [funcionarioId] : []);
        
        if(targetFuncionarios.length === 0) {
            toast({variant: 'destructive', title: 'Nenhum funcionário selecionado!'});
            return;
        }

        targetFuncionarios.forEach(funcId => {
            const newLancamento: Lancamento = {
                id: Date.now() + Math.random(),
                funcionarioId: funcId,
                rubricaId: rubricaId,
                valor: 0,
            };
            newLancamentos.push(newLancamento);
        });

        setLancamentos(prev => [...prev, ...newLancamentos]);
    };

    const handleRemoveLancamento = (id: number) => {
        setLancamentos(prev => prev.filter(l => l.id !== id));
    };

    const handleLancamentoChange = (id: number, field: 'valor' | 'referencia', value: number) => {
        setLancamentos(prev => prev.map(l => l.id === id ? {...l, [field]: value} : l));
    };
    
    const handleCalcularFolha = () => {
        if (selectedFuncionarios.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum funcionário selecionado', description: 'Selecione pelo menos um funcionário para calcular a folha.' });
            return;
        }

        setIsLoading(true);
        // Simulação de cálculo
        setTimeout(() => {
            const novosResultados = selectedFuncionarios.map(funcId => {
                const funcionario = funcionarios.find(f => f.id === funcId);
                if (!funcionario) return null;

                const salarioBase = funcionario.salario;
                const lancamentosFunc = lancamentos.filter(l => l.funcionarioId === funcId);

                const totalProventos = salarioBase + lancamentosFunc.reduce((acc, l) => {
                    const rubrica = rubricasPadrao.find(r => r.id === l.rubricaId);
                    return rubrica?.tipo === 'Provento' ? acc + l.valor : acc;
                }, 0);

                const totalDescontos = lancamentosFunc.reduce((acc, l) => {
                    const rubrica = rubricasPadrao.find(r => r.id === l.rubricaId);
                    return rubrica?.tipo === 'Desconto' ? acc + l.valor : acc;
                }, 0);
                
                // Simulação simples de impostos
                const baseINSS = totalProventos;
                const valorINSS = baseINSS * 0.08; // 8% Fixo (simplificado)
                const baseIRRF = totalProventos - valorINSS;
                const valorIRRF = baseIRRF > 2826.65 ? (baseIRRF * 0.075) - 142.80 : 0; // 7.5% (simplificado)

                return {
                    funcionarioId: funcId,
                    nome: funcionario.nome,
                    totalProventos,
                    totalDescontos: totalDescontos + valorINSS + valorIRRF,
                    salarioLiquido: totalProventos - (totalDescontos + valorINSS + valorIRRF),
                    baseINSS,
                    valorINSS,
                    baseIRRF,
                    valorIRRF,
                };
            }).filter((r): r is ResultadoFolha => r !== null);
            
            setResultados(novosResultados);
            setIsLoading(false);
            toast({title: "Folha de Pagamento Calculada!", description: `${novosResultados.length} funcionários processados.`});
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Folha de Pagamento</h1>
                <p className="text-muted-foreground">Calcule a folha de pagamento mensal de seus funcionários.</p>
            </div>

            {/* SEÇÃO 1: COMPETÊNCIA E FUNCIONÁRIOS */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Seleção de Competência e Funcionários</CardTitle>
                    <CardDescription>Escolha o período e os funcionários para o cálculo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="space-y-2 w-full">
                            <Label htmlFor="mes">Mês</Label>
                            <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
                                <SelectTrigger id="mes"><SelectValue /></SelectTrigger>
                                <SelectContent>{meses.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 w-full">
                            <Label htmlFor="ano">Ano</Label>
                            <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
                                <SelectTrigger id="ano"><SelectValue /></SelectTrigger>
                                <SelectContent>{anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="rounded-md border max-h-64 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox onCheckedChange={handleSelectAll} checked={selectedFuncionarios.length === funcionarios.length && funcionarios.length > 0} />
                                    </TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead className='text-right'>Salário Base</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {funcionarios.map(f => (
                                    <TableRow key={f.id}>
                                        <TableCell><Checkbox checked={selectedFuncionarios.includes(f.id)} onCheckedChange={checked => setSelectedFuncionarios(prev => checked ? [...prev, f.id] : prev.filter(id => id !== f.id))} /></TableCell>
                                        <TableCell className="font-medium">{f.nome}</TableCell>
                                        <TableCell>{f.cargo}</TableCell>
                                        <TableCell className="text-right font-mono">{f.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            
            {/* SEÇÃO 2: LANÇAMENTOS */}
            <Card>
                <CardHeader>
                    <CardTitle>2. Lançamento de Rubricas (Proventos e Descontos)</CardTitle>
                    <CardDescription>Adicione eventos como horas extras, comissões, faltas ou adiantamentos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <LancadorDeRubrica onAddLancamento={handleAddLancamento} />
                     <Separator className='my-6'/>
                     <h4 className='text-md font-medium'>Lançamentos Realizados</h4>
                     <div className="rounded-md border max-h-72 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Funcionário</TableHead>
                                    <TableHead>Rubrica</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Referência</TableHead>
                                    <TableHead className="text-right">Valor (R$)</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lancamentos.map(l => {
                                    const func = funcionarios.find(f => f.id === l.funcionarioId);
                                    const rubrica = rubricasPadrao.find(r => r.id === l.rubricaId);
                                    return (
                                        <TableRow key={l.id}>
                                            <TableCell>{func?.nome}</TableCell>
                                            <TableCell>{rubrica?.descricao}</TableCell>
                                            <TableCell>{rubrica?.tipo}</TableCell>
                                            <TableCell><Input type="number" value={l.referencia || ''} onChange={e => handleLancamentoChange(l.id, 'referencia', parseFloat(e.target.value))} className='h-8 w-24'/></TableCell>
                                            <TableCell className="text-right"><Input type="number" value={l.valor} onChange={e => handleLancamentoChange(l.id, 'valor', parseFloat(e.target.value))} className='h-8 w-32 text-right'/></TableCell>
                                            <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveLancamento(l.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                        </TableRow>
                                    )
                                })}
                                 {lancamentos.length === 0 && <TableRow><TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>Nenhum lançamento adicionado.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleCalcularFolha} disabled={isLoading}>
                        {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Calculator className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Calculando...' : 'Calcular Folha'}
                    </Button>
                </CardFooter>
            </Card>

            {/* SEÇÃO 3: RESULTADOS */}
            {resultados.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>3. Resultados do Cálculo</CardTitle>
                        <CardDescription>Resumo da folha de pagamento processada.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Funcionário</TableHead>
                                        <TableHead className="text-right">Proventos</TableHead>
                                        <TableHead className="text-right">Descontos</TableHead>
                                        <TableHead className="text-right">Líquido</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resultados.map(res => (
                                        <TableRow key={res.funcionarioId}>
                                            <TableCell className="font-medium">{res.nome}</TableCell>
                                            <TableCell className="text-right font-mono text-emerald-600">{res.totalProventos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                            <TableCell className="text-right font-mono text-destructive">{res.totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                            <TableCell className="text-right font-mono font-bold">{res.salarioLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline"><FileText className='mr-2 h-4 w-4'/> Gerar Holerites (PDF)</Button>
                        <Button variant="outline"><BookCopy className='mr-2 h-4 w-4'/> Contabilizar Folha</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

function LancadorDeRubrica({ onAddLancamento }: { onAddLancamento: (id: number, tipo: 'coletivo' | 'individual', funcId?: number) => void }) {
    const [selectedRubricaId, setSelectedRubricaId] = useState<string>('');

    const handleAddClick = () => {
        if(selectedRubricaId) {
            onAddLancamento(Number(selectedRubricaId), 'coletivo');
        }
    }

    return (
        <div className='flex gap-4 items-end'>
            <div className='space-y-2 flex-grow'>
                <Label>Adicionar Rubrica Coletivamente</Label>
                <Select value={selectedRubricaId} onValueChange={setSelectedRubricaId}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma rubrica..."/></SelectTrigger>
                    <SelectContent>
                        {rubricasPadrao.map(r => (
                            <SelectItem key={r.id} value={String(r.id)}>{r.codigo} - {r.descricao} ({r.tipo})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleAddClick} variant="outline" type='button'>
                <Plus className='mr-2 h-4 w-4'/> Adicionar
            </Button>
        </div>
    )
}
