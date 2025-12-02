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
import { Separator } from '../ui/separator';

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
        { href: '/conectividade', label: 'eSocial & Reinf', icon: FileText },
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
    if (pathname === href) return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) {
        return true;
    }
    return false;
  };

  return (
    <>
      <SidebarHeader>
        <Button variant="ghost" asChild className="h-12 justify-start px-3 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <Link href="/dashboard" className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold font-headline text-foreground group-data-[collapsible=icon]:hidden">
                EscopoV3
                </span>
            </Link>
        </Button>
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
        
        <Separator className='my-2 bg-border/50' />

        <SidebarMenu>
          {navGroups.map((group) => (
            <div key={group.label} className="group/nav-group">
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
                    {group.label}
                </p>
                {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                        asChild
                        size="sm"
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
                <Separator className='my-2 bg-border/50 last:hidden group-data-[collapsible=icon]:hidden' />
            </div>
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
