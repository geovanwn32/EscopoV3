'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { CompanyProvider, useCompany } from '@/hooks/use-company';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentCompany, companies, isLoaded } = useCompany();

  useEffect(() => {
    if (isLoaded) {
      if (!currentCompany) {
        // Allow access to company creation/selection even if no company is selected
        if (pathname !== '/selecionar-empresa' && pathname !== '/minha-empresa') {
          router.push('/selecionar-empresa');
        }
      } else if (companies.length > 0 && pathname === '/selecionar-empresa') {
        // If a company is selected and user is on selection page, go to dashboard
        router.push('/dashboard');
      }
    }
  }, [isLoaded, currentCompany, companies, pathname, router]);

  // Avoid rendering the main layout if we are about to redirect or not ready
  if (!isLoaded || (!currentCompany && pathname !== '/selecionar-empresa' && pathname !== '/minha-empresa')) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            {/* You can add a loader here */}
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset" className="bg-sidebar text-sidebar-foreground">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
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
