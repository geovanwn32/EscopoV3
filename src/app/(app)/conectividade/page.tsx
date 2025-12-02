import ServiceStatusChecker from './service-status-checker';

export default function ConectividadePage() {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Status dos Serviços da Sefaz</h1>
          <p className="text-muted-foreground">
            Verifique a disponibilidade em tempo real dos serviços da Sefaz para emissão de notas fiscais.
          </p>
        </div>
        <ServiceStatusChecker />
      </div>
    );
  }
