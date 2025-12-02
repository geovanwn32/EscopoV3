import DescriptionGeneratorForm from "./description-generator-form";

export default function LancamentosContabeisPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Lançamentos Contábeis (IA)</h1>
        <p className="text-muted-foreground">
          Use o assistente de IA para sugerir descrições para seus lançamentos manuais.
        </p>
      </div>
      <DescriptionGeneratorForm />
    </div>
  );
}
