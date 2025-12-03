

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
    <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 animated-gradient">
        <div className="relative w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full mx-auto bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden border ring-1 ring-black/5">
                {/* Left Panel */}
                <div className="relative hidden md:flex flex-col justify-between p-8 lg:p-12 bg-primary text-primary-foreground">
                    <DataBlocksAnimation />
                    <div className="z-10">
                        <div className="flex items-center gap-3 text-2xl font-bold font-headline">
                            <Building2 className="h-8 w-8" />
                            <span>EscopoV3</span>
                        </div>
                        <h1 className="text-4xl font-bold mt-8">Bem-vindo ao EscopoV3.</h1>
                        <p className="mt-4 text-lg opacity-80">
                            Seu sistema profissional de gestão contábil, desenvolvido para atender contadores, empresas e MEIs com eficiência, precisão e segurança.
                        </p>
                    </div>
                     <div className="z-10 mt-8 space-y-4 text-sm opacity-70">
                        <p className="font-semibold">Acesse rapidamente as principais funcionalidades:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Lançamento de notas fiscais</li>
                            <li>Apuração de folha de pagamento</li>
                            <li>Cálculo automático de impostos</li>
                            <li>Módulo Financeiro completo</li>
                            <li>Contas a receber e contas a pagar</li>
                            <li>Relatórios específicos para MEI</li>
                        </ul>
                        <p className='pt-4'>Organize sua rotina, acompanhe indicadores e mantenha a contabilidade sempre em dia. Utilize o menu principal para navegar entre os módulos e otimizar suas operações.</p>
                    </div>
                    <p className="z-10 text-xs text-center text-primary-foreground/60 mt-auto">
                        &copy; 2025 EscopoV3. Todos os direitos reservados.
                    </p>
                </div>

                {/* Right Panel */}
                <LoginForm />
            </div>
        </div>
    </div>
  );
}
