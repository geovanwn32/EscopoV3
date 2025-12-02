

export interface ProductItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface ServiceItem {
    id: number;
    name: string;
    value: number;
}

export interface NotaFiscal {
    id: number;
    tipo: 'entrada' | 'saida' | 'servico';
    dados: any; // Could be more specific, e.g., NotaProdutoDados | NotaServicoDados
    items: ProductItem[] | ServiceItem[];
    sourceXmlId?: number; // Armazena o ID do arquivo XML de origem
}

    