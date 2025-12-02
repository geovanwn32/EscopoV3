import StatementImporter from "./statement-importer";

export default function ImportacaoExtratoPage() {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Importação de Extrato (IA)</h1>
          <p className="text-muted-foreground">
            Importe seu extrato bancário e deixe a IA sugerir as contas contábeis.
          </p>
        </div>
        <StatementImporter />
      </div>
    );
  }
  