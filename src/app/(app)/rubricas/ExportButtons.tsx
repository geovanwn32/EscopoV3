
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { FileDown, FileText, Sheet } from 'lucide-react';
import type { Rubrica } from './page';

interface ExportButtonsProps {
    data: Rubrica[];
}

export default function ExportButtons({ data }: ExportButtonsProps) {
    const { toast } = useToast();

    const handleExportPdf = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        doc.text("Relatório de Rubricas", 14, 16);
        
        const tableColumn = ["Código", "Descrição", "Tipo", "Incidências"];
        const tableRows: any[] = [];

        data.forEach(item => {
            const incidencias = Object.entries(item.incidencias)
                .filter(([, value]) => value)
                .map(([key]) => {
                    if (key === 'inss') return 'INSS';
                    if (key === 'irrf') return 'IRRF';
                    if (key === 'fgts') return 'FGTS';
                    if (key === 'contribuicaoSindical') return 'Sindical';
                    return '';
                }).join(', ');

            const row = [
                item.codigo,
                item.descricao,
                item.tipo,
                incidencias,
            ];
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        
        doc.save('relatorio_rubricas.pdf');
        toast({ title: "PDF Gerado!", description: "O relatório de rubricas foi baixado." });
    };

    const handleExportExcel = async () => {
        const XLSX = await import('xlsx');
        const worksheetData = data.map(item => ({
            'Código': item.codigo,
            'Descrição': item.descricao,
            'Tipo': item.tipo,
            'INSS': item.incidencias.inss ? 'Sim' : 'Não',
            'IRRF': item.incidencias.irrf ? 'Sim' : 'Não',
            'FGTS': item.incidencias.fgts ? 'Sim' : 'Não',
            'Contrib. Sindical': item.incidencias.contribuicaoSindical ? 'Sim' : 'Não',
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rubricas");
        XLSX.writeFile(workbook, "relatorio_rubricas.xlsx");
        toast({ title: "Excel Gerado!", description: "O relatório de rubricas foi baixado." });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Exportar</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleExportPdf}><FileText className="mr-2 h-4 w-4" />Exportar para PDF</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportExcel}><Sheet className="mr-2 h-4 w-4" />Exportar para Excel</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

    