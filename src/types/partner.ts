export interface Partner {
    id: number;
    name: string;
    document: string;
    type: 'Cliente' | 'Fornecedor' | 'Transportadora';
}
