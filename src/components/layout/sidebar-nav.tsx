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
  { href: '/configuracoes', label: 'Settings', icon: Settings },
  { href: '/utilitarios/gov-status', label: 'Call Support', icon: HelpCircle },
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
              Square
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between items-center group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-3 text-left">
                        <Avatar className='h-8 w-8'>
                            <AvatarFallback className='text-xs bg-muted text-muted-foreground'>
                                {activeCompany?.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className="font-semibold text-sm">{activeCompany?.name}</span>
                            <span className="text-xs text-muted-foreground">ID: {activeCompany?.id}</span>
                        </div>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                {companies.map(company => (
                    <DropdownMenuItem key={company.id} onSelect={() => handleCompanySwitch(company.id)}>
                        {company.name}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleGoToSelection}>Manage Companies</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <SidebarMenu className="mt-6">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
                MAIN MENU
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
                ADDITIONAL
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
