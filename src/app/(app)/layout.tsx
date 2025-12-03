

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { CompanyProvider, useCompany } from '@/hooks/use-company';
import { AuditLog, logAudit } from '@/lib/audit-log';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentCompany, isLoaded, useScopedData } = useCompany();
  const [, setAuditLogs] = useScopedData<AuditLog[]>('audit-trail-logs', []);
  const loginLoggedRef = useRef(false);

  const { open: isSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isLoaded) {
      const activeProfile = sessionStorage.getItem('user-profile');

      // New Flow: Profile -> Company
      // 1. If no profile, go to profile selection.
      if (!activeProfile && pathname !== '/selecionar-perfil' && pathname !== '/selecionar-empresa' && pathname !== '/login') {
          router.push('/selecionar-perfil');
      }
      // 2. If has profile but no company, go to company selection.
      else if (activeProfile && !currentCompany && pathname !== '/selecionar-empresa') {
        router.push('/selecionar-empresa');
      }
      // 3. Log login audit once everything is set.
      else if (currentCompany && activeProfile && !loginLoggedRef.current) {
        logAudit(setAuditLogs, 'LOGIN', 'Autenticação', 'Login bem-sucedido no sistema.');
        loginLoggedRef.current = true;
      }
    }
  }, [isLoaded, currentCompany, pathname, router, setAuditLogs]);

  // Allow access to selection pages
  if (pathname === '/selecionar-empresa' || pathname === '/selecionar-perfil') {
    return <>{children}</>;
  }
  
  if (!isLoaded || !currentCompany) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
        </div>
    );
  }

  return (
      <div className="flex flex-1">
        <Sidebar className="bg-sidebar">
          <SidebarNav />
        </Sidebar>
        <div
          className={cn(
            "flex flex-col h-full flex-1 transition-all duration-300 ease-in-out",
            !isMobile && (isSidebarOpen ? "ml-72" : "ml-20")
          )}
        >
          <Header />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <SidebarProvider>
        <div className="flex h-full w-full bg-background">
          <AppLayoutContent>{children}</AppLayoutContent>
        </div>
      </SidebarProvider>
    </CompanyProvider>
  );
}
