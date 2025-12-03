

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

export interface Product {
    id: number;
    tipo: 'Produto' | 'Serviço';
    codigo: string;
    descricao: string;
    valor: number;
    unidadeMedida: string;
    ncm: string;
    cest: string;
    cfop: string;
    origem: string;
    icms: {
        cst: string;
        aliquota: number;
        baseCalculo: number;
    };
    ipi: {
        cst: string;
        aliquota: number;
    };
    pis: {
        cst: string;
        aliquota: number;
    };
    cofins: {
        cst: string;
        aliquota: number;
    };
}
    