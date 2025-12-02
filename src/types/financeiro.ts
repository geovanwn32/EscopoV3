export type StatusConta = 'Pendente' | 'Recebido' | 'Atrasado';

export interface Conta {
    id: number;
    partnerName: string;
    description: string;
    amount: number;
    dueDate: string; // ISO string format
    status: StatusConta;
}
