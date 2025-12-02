'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Users,
  Book,
  Banknote,
  Archive,
  Plug,
  Wrench,
  Settings,
  HelpCircle,
  ChevronsUpDown,
  Building,
  Shield,
  LayoutGrid,
  PlusCircle,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useCompany } from '@/hooks/use-company';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fiscal', label: 'Fiscal', icon: FileText },
  { href: '/pessoal', label: 'Pessoal', icon: Users },
  { href: '/contabil', label: 'Contábil', icon: Book },
];

const additionalNav: NavItem[] = [
  { href: '/financeiro', label: 'Financeiro', icon: Banknote },
  { href: '/cadastros', label: 'Cadastros', icon: Archive },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/utilitarios/gov-status', label: 'Suporte', icon: HelpCircle },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { companies, currentCompany, switchCompany, addCompany } = useCompany();
  const router = useRouter();

  const activeCompany = companies.find(c => c.id === currentCompany);

  const isNavItemActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) {
        return true;
    }
    return false;
  };

  const handleCompanySwitch = (companyId: number) => {
    switchCompany(companyId);
  }

  const handleGoToSelection = () => {
    router.push('/selecionar-empresa');
  }
  
  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="h-10 w-10 p-0 justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-primary" />
              </Link>
          </Button>
          <span className="text-xl font-semibold font-headline text-foreground group-data-[collapsible=icon]:hidden">
              EscopoV3
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        
        <SidebarMenu className="mt-6">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
                MENU PRINCIPAL
            </p>
            {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isNavItemActive(item.href)}
                    tooltip={item.label}
                    >
                    <Link href={item.href}>
                        <item.icon />
                        <span className='group-data-[collapsible=icon]:hidden'>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        
        <SidebarMenu className="mt-6">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
                ADICIONAL
            </p>
            {additionalNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isNavItemActive(item.href)}
                    tooltip={item.label}
                    >
                    <Link href={item.href}>
                        <item.icon />
                        <span className='group-data-[collapsible=icon]:hidden'>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>

      </SidebarContent>
      <SidebarFooter className="p-2">
      </SidebarFooter>
    </>
  );
}
