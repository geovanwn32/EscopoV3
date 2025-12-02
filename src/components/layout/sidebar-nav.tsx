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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  Shield,
  Building2,
  List,
  UserCheck,
  Package,
  FileStack,
  Receipt,
  FileSignature,
  LineChart,
  Calendar,
  Folder,
  Activity,
  UserCog,
  FileCog,
  FileKey2,
  FileInput,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Fiscal',
    icon: FileText,
    items: [
      { href: '/fiscal', label: 'Lançamentos', icon: FileStack },
      { href: '/fiscal/orcamento', label: 'Orçamentos', icon: FileSignature },
      { href: '/fiscal/apuracao', label: 'Apuração', icon: Receipt },
      { href: '/fiscal/inventario', label: 'Inventário', icon: Package },
    ],
  },
  {
    label: 'Pessoal',
    icon: Users,
    items: [
      { href: '/pessoal', label: 'Central', icon: UserCog },
      { href: '/pessoal/folha-de-pagamento', label: 'Folha', icon: FileCog },
      { href: '/pessoal/rci', label: 'RCI', icon: FileKey2 },
    ],
  },
  {
    label: 'Contábil',
    icon: Book,
    items: [
      { href: '/contabil/plano-de-contas', label: 'Plano de Contas', icon: List },
      { href: '/contabil/lancamentos', label: 'Lançamentos (IA)', icon: Activity },
      { href: '/contabil/importacao-extrato', label: 'Importar Extrato (IA)', icon: FileInput },
    ],
  },
  {
    label: 'Financeiro',
    icon: Banknote,
    items: [
      { href: '/financeiro/contas-a-receber', label: 'A Receber', icon: TrendingUp },
      { href: '/financeiro/contas-a-pagar', label: 'A Pagar', icon: TrendingDown },
      { href: '/financeiro/fluxo-de-caixa', label: 'Fluxo de Caixa', icon: LineChart },
    ],
  },
  {
    label: 'Cadastros',
    icon: Archive,
    items: [
      { href: '/parceiros', label: 'Parceiros', icon: Users },
      { href: '/funcionarios', label: 'Funcionários', icon: UserCheck },
      { href: '/socios', label: 'Sócios', icon: UserCheck },
      { href: '/produtos', label: 'Produtos', icon: Package },
      { href: '/servicos', label: 'Serviços', icon: Wrench },
    ],
  },
   {
    label: 'Conectividade',
    icon: Plug,
    items: [
        { href: '/conectividade/esocial', label: 'eSocial', icon: FileText },
        { href: '/conectividade/efd-reinf', label: 'EFD-Reinf', icon: FileText },
    ],
  },
   {
    label: 'Utilitários',
    icon: Wrench,
    items: [
        { href: '/utilitarios/eventos', label: 'Agenda', icon: Calendar },
        { href: '/utilitarios/arquivos', label: 'Arquivos', icon: Folder },
        { href: '/utilitarios/audit-trail', label: 'Auditoria', icon: Activity },
        { href: '/utilitarios/gov-status', label: 'Status Governo', icon: Plug },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { href: '/minha-empresa', label: 'Minha Empresa', icon: Building2 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isNavItemActive = (href: string) => {
    // Exact match for most cases
    if (pathname === href) return true;
    // For group items, check if the current path starts with the group's base path
    // This is useful for keeping the parent group active.
    // Example: if path is '/fiscal/apuracao', '/fiscal' should be considered active.
    if (href !== '/dashboard' && pathname.startsWith(href) && href.split('/').length > 1) {
        const pathSegments = pathname.split('/');
        const hrefSegments = href.split('/');
        // Make sure it's not a false positive for root paths
        if (pathSegments.length > 2 && hrefSegments.length > 1) {
             return pathSegments[1] === hrefSegments[1];
        }
    }
    return false;
  };

  const getActiveGroup = () => {
    for (const group of navGroups) {
      if (group.items.some(item => pathname.startsWith(item.href.substring(0, item.href.lastIndexOf('/')) || item.href))) {
        const basePath = `/${pathname.split('/')[1]}`;
        const mainGroup = navGroups.find(g => g.items.some(i => i.href.startsWith(basePath)));
        if (mainGroup) return mainGroup.label;
      }
    }
    return undefined;
  };


  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            <Button variant="ghost" className="h-12 w-12 p-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                <Building2 className="h-6 w-6 text-sidebar-primary" />
            </Button>
            <span className="text-lg font-semibold font-headline text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
            EscopoV3
            </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isNavItemActive('/dashboard')}
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <Accordion type="single" collapsible defaultValue={getActiveGroup()} className="w-full group-data-[collapsible=icon]:hidden">
           {navGroups.map((group) => (
            <AccordionItem value={group.label} key={group.label} className="border-b-0">
               <AccordionTrigger 
                  className={cn(
                    "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                    "hover:no-underline [&[data-state=open]>svg]:text-sidebar-accent-foreground",
                    group.items.some(item => isNavItemActive(item.href)) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                >
                    <group.icon />
                    <span>{group.label}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                    <SidebarMenu className="pl-5 pr-1 py-1 border-l border-sidebar-border ml-3">
                        {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                            asChild
                            size="sm"
                            isActive={pathname === item.href}
                            tooltip={item.label}
                            >
                            <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
              </AccordionContent>
            </AccordionItem>
           ))}
        </Accordion>

        {/* Icon-only view for collapsed sidebar */}
        <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
            {navGroups.map((group) => (
                <SidebarMenuItem key={group.label}>
                    <SidebarMenuButton
                        asChild
                        isActive={group.items.some(item => isNavItemActive(item.href))}
                        tooltip={group.label}
                    >
                        <Link href={group.items[0]?.href || '#'}>
                            <group.icon/>
                            <span className="sr-only">{group.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>

      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isNavItemActive(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}