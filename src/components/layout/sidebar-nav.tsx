'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Users,
  Book,
  Banknote,
  Archive,
  Plug,
  BarChart2,
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';

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
      { href: '/contabil/importacao-extrato', label: 'Importar Extrato (IA)', icon: FileInputIcon },
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
];

const bottomNavItems: NavItem[] = [
  { href: '/minha-empresa', label: 'Minha Empresa', icon: Building2 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/admin', label: 'Admin', icon: Shield },
];


function FileInputIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M2.5 14.28A2 2 0 0 0 2 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 1.72-.8L14.5 13.5" />
        <path d="m14 18-3-3" />
        <path d="M9.5 12.5 14 8" />
      </svg>
    )
  }
  
  function TrendingDown(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
        <polyline points="16 17 22 17 22 11" />
      </svg>
    )
  }
  
  function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    )
  }

export function SidebarNav() {
  const pathname = usePathname();

  const isNavItemActive = (href: string) => {
    return pathname === href;
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
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">
                <group.icon className="hidden group-data-[collapsible=icon]:block"/>
                <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
         <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">
                <Plug className="hidden group-data-[collapsible=icon]:block"/>
                <span className="group-data-[collapsible=icon]:hidden">Conectividade</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" tooltip="eSocial" isActive={isNavItemActive('/conectividade/esocial')}><Link href="#"><FileText />eSocial</Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" tooltip="EFD-Reinf" isActive={isNavItemActive('/conectividade/efd-reinf')}><Link href="#"><FileText />EFD-Reinf</Link></SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
         <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">
                <Wrench className="hidden group-data-[collapsible=icon]:block"/>
                <span className="group-data-[collapsible=icon]:hidden">Utilitários</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" tooltip="Agenda" isActive={isNavItemActive('/utilitarios/eventos')}><Link href="#"><Calendar />Agenda</Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" tooltip="Arquivos" isActive={isNavItemActive('/utilitarios/arquivos')}><Link href="#"><Folder />Arquivos</Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" tooltip="Auditoria" isActive={isNavItemActive('/utilitarios/audit-trail')}><Link href="/utilitarios/audit-trail"><Activity />Auditoria</Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" tooltip="Status Governo" isActive={isNavItemActive('/utilitarios/gov-status')}><Link href="/utilitarios/gov-status"><Plug />Status Governo</Link></SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
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
