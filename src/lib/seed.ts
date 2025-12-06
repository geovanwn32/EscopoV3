// @ts-nocheck
// To run this seed script, open the browser's developer console and run:
// seedData()

import { PlaceHolderImages } from './placeholder-images';

export function seedData() {
    if (typeof window === 'undefined') {
        console.error("This script must be run in a browser environment.");
        return;
    }

    console.log("🌱 Starting to seed data into localStorage...");

    try {
        // --- COMPANIES ---
        const companies = [
            {
                id: 1672531200000,
                name: "Ágio Soluções em Software Ltda",
                data: {
                    razaoSocial: "Ágio Soluções em Software Ltda",
                    nomeFantasia: "Ágio Soluções",
                    cnpj: "62.667.939/0001-61",
                    inscricaoEstadual: "123.456.789.112",
                    inscricaoMunicipal: "9.876.543-2",
                    telefone: "(62) 3289-4578",
                    email: "contato@agio.com.br",
                    cep: "74000-000",
                    logradouro: "Avenida Anhanguera",
                    numero: "1234",
                    complemento: "Sala 10",
                    bairro: "Setor Central",
                    cidade: "Goiânia",
                    uf: "GO",
                    regimeTributario: "simples",
                    cnaePrincipal: "6201-5/01",
                    logo: PlaceHolderImages.find(p => p.id === 'login-character')?.imageUrl || '',
                    contadorNome: "Carlos Contábil",
                    contadorCpf: "111.222.333-44",
                    contadorCrc: "GO-012345/O-0",
                    planoId: "Empresarial",
                    statusLicenca: "Ativa",
                    dataVencimentoLicenca: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                }
            }
        ];
        localStorage.setItem('companies', JSON.stringify(companies));
        localStorage.setItem('currentCompany', JSON.stringify(companies[0].id));
        console.log("🏢 Companies seeded.");

        // --- GLOBAL USERS ---
        const globalUsers = [
            {
                id: 1,
                uid: "admin-user-uid",
                name: "Geovani Silva",
                email: "admin@agio.com.br",
                isAdmin: true,
                isMaster: true,
                password: "123456",
                permissions: {},
                allowedCompanyIds: [1672531200000],
                status: "Ativo",
                creationDate: new Date().toISOString(),
                planoId: "Empresarial",
                statusLicenca: "Ativa",
                dataExpiracaoLicenca: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                photoURL: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || ''
            },
            {
                id: 2,
                uid: "common-user-uid",
                name: "Ana Costa",
                email: "ana.costa@example.com",
                isAdmin: false,
                isMaster: false,
                password: "123456",
                permissions: { dashboard: true, fiscal: true },
                allowedCompanyIds: [1672531200000],
                status: "Ativo",
                creationDate: new Date().toISOString(),
                planoId: "Profissional",
                statusLicenca: "Ativa",
                dataVencimentoLicenca: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=faces"
            }
        ];
        localStorage.setItem('global-users', JSON.stringify(globalUsers));
        console.log("👥 Global users seeded.");

        const companyId = companies[0].id;

        // --- PARTNERS ---
        const partners = [
            { id: 1, personType: 'JURIDICA', name: 'Fornecedor de Tecnologia S/A', document: '11.222.333/0001-44', type: 'Fornecedor', email: 'contato@fornecedortec.com' },
            { id: 2, personType: 'JURIDICA', name: 'Cliente Final Ltda', document: '44.555.666/0001-77', type: 'Cliente', email: 'compras@clientefinal.com' }
        ];
        localStorage.setItem(`company-${companyId}-partners`, JSON.stringify(partners));
        console.log("🤝 Partners seeded.");

        // --- FUNCIONARIOS ---
        const funcionarios = [
            { id: 1, nome: 'João da Silva', cpf: '111.111.111-11', dataAdmissao: new Date().toISOString(), cargo: 'Desenvolvedor', departamento: 'T.I.', salario: 5000 },
            { id: 2, nome: 'Maria Oliveira', cpf: '222.222.222-22', dataAdmissao: new Date().toISOString(), cargo: 'Analista Financeiro', departamento: 'Financeiro', salario: 4500 }
        ];
        localStorage.setItem(`company-${companyId}-cadastros-funcionarios`, JSON.stringify(funcionarios));
        console.log("🧑‍💼 Funcionários seeded.");

        // --- RUBRICAS ---
        const rubricas = [
            { id: 1, codigo: '1000', descricao: 'Salário Base', tipo: 'Provento', incidencias: { inss: true, irrf: true, fgts: true, contribuicaoSindical: false } },
            { id: 2, codigo: '1200', descricao: 'Horas Extras 50%', tipo: 'Provento', incidencias: { inss: true, irrf: true, fgts: true, contribuicaoSindical: false } },
            { id: 3, codigo: '9201', descricao: 'INSS', tipo: 'Desconto', incidencias: { inss: false, irrf: false, fgts: false, contribuicaoSindical: false } },
            { id: 4, codigo: '9202', descricao: 'IRRF', tipo: 'Desconto', incidencias: { inss: false, irrf: false, fgts: false, contribuicaoSindical: false } }
        ];
        localStorage.setItem(`company-${companyId}-cadastros-rubricas`, JSON.stringify(rubricas));
        console.log("📋 Rubricas seeded.");

        // --- PRODUTOS ---
        const produtos = [
            { id: 1, tipo: 'Produto', codigo: 'P001', descricao: 'Licença de Software Anual', valor: 1200, unidadeMedida: 'UN', ncm: '8523.49.90', cfop: '5.102', icms: {}, ipi: {}, pis: {}, cofins: {} }
        ];
        localStorage.setItem(`company-${companyId}-cadastros-produtos`, JSON.stringify(produtos));
        console.log("📦 Produtos seeded.");

        // --- CONTAS A RECEBER ---
        const contasReceber = [
            { id: 1, partnerName: 'Cliente Final Ltda', description: 'Venda de software', amount: 1500, dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), status: 'Pendente' },
            { id: 2, partnerName: 'Cliente Final Ltda', description: 'Serviço de consultoria', amount: 800, dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), status: 'Atrasado' }
        ];
        localStorage.setItem(`company-${companyId}-financeiro-contas-a-receber`, JSON.stringify(contasReceber));
        console.log("📈 Contas a Receber seeded.");

        // --- CONTAS A PAGAR ---
        const contasPagar = [
            { id: 1, partnerName: 'Fornecedor de Tecnologia S/A', description: 'Assinatura de API', amount: 250, dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), status: 'Pendente' },
            { id: 2, partnerName: 'Fornecedor de Tecnologia S/A', description: 'Aluguel de Servidores', amount: 500, dueDate: new Date().toISOString(), status: 'Pendente' }
        ];
        localStorage.setItem(`company-${companyId}-financeiro-contas-a-pagar`, JSON.stringify(contasPagar));
        console.log("📉 Contas a Pagar seeded.");

        console.log("✅ Seeding finished successfully! Please refresh the page.");

    } catch (e) {
        console.error("❌ An error occurred during seeding:", e);
    }
}

if (typeof window !== 'undefined') {
    (window as any).seedData = seedData;
}
