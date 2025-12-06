export type StatusConta = 'Pendente' | 'Recebido' | 'Atrasado' | 'Pago';

export interface Conta {
    id: string;
    tipo: 'receber' | 'pagar';
    partnerName: string;
    description: string;
    amount: number;
    dueDate: string; // ISO string format
    status: StatusConta;
}
