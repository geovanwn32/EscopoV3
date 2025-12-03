
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
            <div className="grid grid-cols-1 max-w-6xl w-full mx-auto bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden border ring-1 ring-black/5">

                {/* Right Panel */}
                <LoginForm />
            </div>
        </div>
    </div>
  );
}
