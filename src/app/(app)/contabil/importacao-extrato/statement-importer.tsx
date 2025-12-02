'use client';
import { useState } from 'react';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { suggestBankAccountAssociations } from '@/ai/flows/suggest-bank-account-associations';
import { Badge } from '@/components/ui/badge';

type TransactionStatus = 'pending' | 'loading' | 'suggested' | 'error';
interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  status: TransactionStatus;
  suggestion?: string;
  confidence?: number;
}

const mockTransactions: Omit<Transaction, 'status' | 'suggestion' | 'confidence'>[] = [
  { id: 1, date: '2024-07-25', description: 'PIX RECEBIDO - JOAO DA SILVA', amount: 1500.00 },
  { id: 2, date: '2024-07-25', description: 'PAGTO FORNECEDOR ABC LTDA', amount: -350.75 },
  { id: 3, date: '2024-07-24', description: 'DELL COMPUTADORES', amount: -4500.00 },
  { id: 4, date: '2024-07-23', description: 'SALARIO MES 07', amount: -5000.00 },
  { id: 5, date: '2024-07-22', description: 'PGTO ALUGUEL ESCRITORIO', amount: -2500.00 },
];

// Mock data for AI suggestions
const mockPreviousAssociations = [
  { description: "FORNECEDOR XYZ", account: "Fornecedores" },
  { description: "COMPRA DE MATERIAL", account: "Despesas com Materiais" },
];
const mockLedgerBalances = { "Receita de Vendas": 50000, "Despesas com Salários": -25000, "Fornecedores": -10000 };

export default function StatementImporter() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImport = () => {
    setTransactions(mockTransactions.map(t => ({ ...t, status: 'pending' })));
  };

  const handleSuggestion = async () => {
    setIsProcessing(true);
    setTransactions(current => current.map(t => ({ ...t, status: 'loading' })));

    const suggestionPromises = transactions.map(async (t) => {
      try {
        const result = await suggestBankAccountAssociations({
          transactionDescription: t.description,
          transactionAmount: t.amount,
          previousAssociations: mockPreviousAssociations,
          currentLedgerBalances: mockLedgerBalances,
        });
        return { ...t, status: 'suggested' as TransactionStatus, suggestion: result.suggestedAccount, confidence: result.confidenceScore };
      } catch (error) {
        console.error(`Error suggesting for transaction ${t.id}:`, error);
        return { ...t, status: 'error' as TransactionStatus };
      }
    });
    
    // Process promises sequentially with a small delay for better UX
    const newTransactions: Transaction[] = [];
    for (const promise of suggestionPromises) {
        newTransactions.push(await promise);
        setTransactions([...newTransactions, ...transactions.slice(newTransactions.length).map(t => ({...t, status: 'loading'}))]);
        await new Promise(res => setTimeout(res, 300));
    }

    setIsProcessing(false);
    toast({
        title: 'Sugestões Geradas!',
        description: 'A IA analisou as transações e sugeriu as contas contábeis.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contabilização de Extrato</CardTitle>
        <CardDescription>
          {transactions.length === 0
            ? 'Importe um extrato para começar a contabilização assistida por IA.'
            : 'As transações do extrato estão prontas para análise.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Importar Extrato Bancário</h3>
            <p className="mt-1 text-sm text-muted-foreground">Clique no botão abaixo para simular a importação.</p>
            <Button className="mt-4" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" /> Simular Importação
            </Button>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor (R$)</TableHead>
                  <TableHead className="text-center">Conta Sugerida (IA)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.date}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell className={`text-right font-mono ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-center">
                      {t.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin mx-auto" />}
                      {t.status === 'suggested' && t.suggestion && (
                        <Badge variant={t.confidence && t.confidence > 0.8 ? 'default' : 'secondary'}>{t.suggestion}</Badge>
                      )}
                      {t.status === 'error' && <Badge variant="destructive">Erro</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {transactions.length > 0 && (
        <CardFooter className="flex justify-between">
            <p className='text-sm text-muted-foreground font-code'>Powered by Genkit AI</p>
            <Button onClick={handleSuggestion} disabled={isProcessing}>
                {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isProcessing ? 'Analisando...' : 'Sugerir Contas'}
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
