export interface ProductItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface ServiceItem {
    id: string;
    name: string;
    value: number;
}

export interface NotaFiscal {
    id: string;
    tipo: 'entrada' | 'saida' | 'servico';
    dados: any; // Could be more specific, e.g., NotaProdutoDados | NotaServicoDados
    items: ProductItem[] | ServiceItem[];
    sourceXmlId?: string; // Armazena o ID do arquivo XML de origem
}

export interface Product {
    id: string;
    empresaId?: string;
    tipo: 'Produto';
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

export interface Service {
    id: string;
    empresaId?: string;
    tipo: 'Serviço';
    codigo: string;
    descricao: string;
    valor: number;
    cfop: string;
    codigoServicoLC116: string;
    pis: {
        cst: string;
        aliquota: number;
    };
    cofins: {
        cst: string;
        aliquota: number;
    };
}
