
import { Building2, ArrowLeft } from 'lucide-react';
import LoginForm from './login-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


function DataBlocksAnimation() {
  // This component's logic is client-side to prevent hydration errors
  // but it is rendered from the Server Component parent.
  // We will make it a client component in a separate file if needed.
  // For now, we can create it without client-side hooks.
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 data-block-container" aria-hidden="true">
      {/* The animation will be handled purely by CSS if possible */}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8">
        <div className="relative w-full h-full">
            <Button asChild variant="ghost" className="absolute top-4 left-4 z-10 text-card-foreground">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Link>
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full mx-auto bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden border ring-1 ring-black/5">

                {/* Left Panel */}
                <div className="relative hidden lg:flex flex-col justify-between items-center p-12 bg-primary text-primary-foreground text-center">
                <DataBlocksAnimation />
                <div className="absolute top-12 left-12 flex items-center gap-3 z-10">
                    <Building2 className="h-8 w-8" />
                    <h1 className="text-2xl font-bold">EscopoV3</h1>
                </div>
                <div className='my-auto z-10'>
                    <h2 className="text-3xl font-bold mb-4">Bem-vindo ao EscopoV3.</h2>
                    <div className="text-primary-foreground/80 max-w-lg mx-auto text-left text-sm">
                            Seu sistema profissional de gestão contábil, desenvolvido para atender contadores, empresas e MEIs com eficiência, precisão e segurança. Acesse rapidamente as principais funcionalidades:
                            <br/><br/>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Lançamento de notas fiscais</li>
                                <li>Apuração de folha de pagamento</li>
                                <li>Cálculo automático de impostos</li>
                                <li>Módulo Financeiro completo</li>
                                <li>Contas a receber e contas a pagar</li>
                                <li>Relatórios específicos para MEI</li>
                            </ul>
                            <br/>
                            Organize sua rotina, acompanhe indicadores e mantenha a contabilidade sempre em dia. Utilize o menu principal para navegar entre os módulos e otimizar suas operações.
                    </div>
                </div>
                <p className='text-sm text-primary-foreground/60 z-10'>© 2025 EscopoV3. Todos os direitos reservados.</p>
                </div>

                {/* Right Panel */}
                <LoginForm />
            </div>
        </div>
    </div>
  );
}
