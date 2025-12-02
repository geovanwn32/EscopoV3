
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
  Settings,
  Building,
  LifeBuoy,
  Building2,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useCompany } from '@/hooks/use-company';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '../ui/dropdown-menu';
import { Card, CardContent } from '../ui/card';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: NavItem[];
}

const mainMenu: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    href: '/fiscal', 
    label: 'Fiscal', 
    icon: FileText,
    subItems: [
        { href: '/fiscal', label: 'Lançamentos', icon: FileText },
        { href: '/fiscal/orcamento', label: 'Orçamentos', icon: FileText },
        { href: '/fiscal/apuracao', label: 'Apuração', icon: FileText },
        { href: '/fiscal/inventario', label: 'Inventário', icon: FileText },
    ]
  },
  { 
    href: '/pessoal', 
    label: 'Pessoal', 
    icon: Users,
    subItems: [
        { href: '/pessoal', label: 'Central', icon: Users },
        { href: '/pessoal/folha-de-pagamento', label: 'Folha', icon: Users },
        { href: '/pessoal/rci', label: 'RCI', icon: Users },
    ]
  },
  { 
    href: '/contabil', 
    label: 'Contábil', 
    icon: Book,
    subItems: [
        { href: '/contabil/plano-de-contas', label: 'Plano de Contas', icon: Book },
        { href: '/contabil/lancamentos', label: 'Lançamentos (IA)', icon: Book },
        { href: '/contabil/importacao-extrato', label: 'Importar Extrato (IA)', icon: Book },
    ]
  },
   { 
    href: '/financeiro', 
    label: 'Financeiro', 
    icon: Banknote,
    subItems: [
        { href: '/financeiro/contas-a-receber', label: 'A Receber', icon: Banknote },
        { href: '/financeiro/contas-a-pagar', label: 'A Pagar', icon: Banknote },
        { href: '/financeiro/fluxo-de-caixa', label: 'Fluxo de Caixa', icon: Banknote },
    ]
  },
];

const secondaryMenu: NavItem[] = [
    { 
        href: '/cadastros', 
        label: 'Cadastros', 
        icon: Archive,
        subItems: [
            { href: '/parceiros', label: 'Parceiros', icon: Archive },
            { href: '/funcionarios', label: 'Funcionários', icon: Archive },
            { href: '/socios', label: 'Sócios', icon: Archive },
            { href: '/produtos', label: 'Produtos', icon: Archive },
            { href: '/servicos', label: 'Serviços', icon: Archive },
        ]
    },
    { href: '/conectividade', label: 'Conectividade', icon: Plug },
    { 
        href: '/utilitarios', 
        label: 'Utilitários', 
        icon: Wrench,
        subItems: [
            { href: '/utilitarios/audit-trail', label: 'Trilha de Auditoria', icon: Wrench },
            { href: '/utilitarios/gov-status', label: 'Status de Serviços', icon: Wrench },
            { href: '/utilitarios/eventos', label: 'Agenda de Eventos', icon: Wrench },
            { href: '/utilitarios/arquivos', label: 'Arquivos', icon: Wrench },
        ]
    },
]


export function SidebarNav() {
  const pathname = usePathname();
  const { companies, currentCompany, switchCompany } = useCompany();
  const router = useRouter();

  const activeCompany = companies.find(c => c.id === currentCompany);

  const isNavItemActive = (href: string) => {
    if (pathname === href) return true;
    // Don't mark the root as active for all sub-paths
    if (href === '/dashboard' && pathname !== '/dashboard') return false;
    if (pathname.startsWith(href)) {
        return true;
    }
    return false;
  };
  
  const companyDisplayName = activeCompany?.data?.nomeFantasia || activeCompany?.name;

  return (
    <>
      <SidebarHeader className="p-4 space-y-4">
        <div className='flex items-center gap-3'>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-6 w-6" />
            </div>
            <div className='flex flex-col group-data-[collapsible=icon]:hidden min-w-0'>
                <span className="font-bold text-lg tracking-tight">EscopoV3</span>
            </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu className="mt-4">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
                MENU PRINCIPAL
            </p>
            {mainMenu.map((item) => (
                <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton
                        asChild
                        size="lg"
                        isActive={isNavItemActive(item.href)}
                        tooltip={item.label}
                        >
                        <Link href={item.subItems ? item.subItems[0].href : item.href}>
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
            {secondaryMenu.map((item) => (
                <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton
                        asChild
                        size="lg"
                        isActive={isNavItemActive(item.href)}
                        tooltip={item.label}
                        >
                        <Link href={item.subItems ? item.subItems[0].href : item.href}>
                            <item.icon />
                            <span className='group-data-[collapsible=icon]:hidden'>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>

      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <Separator className="mb-4" />
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Configurações" isActive={isNavItemActive('/configuracoes')}>
                    <Link href="/configuracoes">
                        <Settings />
                        <span className='group-data-[collapsible=icon]:hidden'>Configurações</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" tooltip="Suporte">
                            <LifeBuoy />
                            <span className='group-data-[collapsible=icon]:hidden'>Suporte</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="mb-2">
                        <DropdownMenuLabel>Canais de Suporte</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                             <a href="tel:+5562998554529">
                                <Phone className="mr-2 h-4 w-4" />
                                Telefone
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                             <a href="mailto:geovaniwn@gmail.com">
                                <Mail className="mr-2 h-4 w-4" />
                                E-mail
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href="https://wa.me/5562992127752" target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                WhatsApp
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Minha Empresa" isActive={isNavItemActive('/minha-empresa')}>
                    <Link href="/minha-empresa">
                        <Building />
                        <span className='group-data-[collapsible=icon]:hidden'>Minha Empresa</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
