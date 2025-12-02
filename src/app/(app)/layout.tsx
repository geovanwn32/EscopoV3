
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { CompanyProvider, useCompany } from '@/hooks/use-company';
import { AuditLog, logAudit } from '@/lib/audit-log';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentCompany, isLoaded, useScopedData } = useCompany();
  const [, setAuditLogs] = useScopedData<AuditLog[]>('audit-trail-logs', []);
  const loginLoggedRef = useRef(false);

  useEffect(() => {
    if (isLoaded) {
      if (!currentCompany) {
        if (pathname !== '/selecionar-empresa' && pathname !== '/minha-empresa') {
          router.push('/selecionar-empresa');
        }
      } else {
        if (!loginLoggedRef.current) {
          logAudit(setAuditLogs, 'LOGIN', 'Autenticação', 'Login bem-sucedido no sistema.');
          loginLoggedRef.current = true;
        }
      }
    }
  }, [isLoaded, currentCompany, pathname, router, setAuditLogs]);

  if (!isLoaded || (!currentCompany && pathname !== '/selecionar-empresa' && pathname !== '/minha-empresa')) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
        </div>
    );
  }

  // Hide sidebar and header for selecionar-empresa page
  if (pathname === '/selecionar-empresa') {
    return <main className="flex-1 p-4 lg:p-6 bg-background">{children}</main>;
  }


  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar className="bg-sidebar">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Header />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </CompanyProvider>
  );
}
