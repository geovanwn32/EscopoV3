import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-sidebar text-sidebar-foreground">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-background p-4 lg:p-6">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
