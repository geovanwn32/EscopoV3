export type AccountType = 'Sintética' | 'Analítica';
export type AccountNature = 'Devedora' | 'Credora';
export type AccountStatus = 'Ativa' | 'Inativa';

export interface Account {
    id: number;
    parentId: number | null;
    code: string;
    name: string;
    type: AccountType;
    nature: AccountNature;
    status: AccountStatus;
}
