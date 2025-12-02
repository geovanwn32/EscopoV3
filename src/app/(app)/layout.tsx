import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { CompanyProvider } from '@/hooks/use-company';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
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
    </CompanyProvider>
  );
}
