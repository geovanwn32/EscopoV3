
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
  HelpCircle,
  ChevronsUpDown,
  Building,
  Shield,
  LayoutGrid,
  PlusCircle,
  Check,
  LifeBuoy,
  LogOut,
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
    { href: '/utilitarios', label: 'Utilitários', icon: Wrench },
]


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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto px-2 py-1.5">
                    <div className="flex items-center gap-3">
                        <Avatar className='h-9 w-9'>
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {activeCompany?.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                            <span className="font-semibold text-sm">{activeCompany?.name}</span>
                            <span className="text-xs text-muted-foreground">Ver empresas</span>
                        </div>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
                <DropdownMenuLabel>Mudar de empresa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companies.map(company => (
                    <DropdownMenuItem key={company.id} onSelect={() => handleCompanySwitch(company.id)}>
                        <Check className={`mr-2 h-4 w-4 ${currentCompany === company.id ? 'opacity-100' : 'opacity-0'}`} />
                        {company.name}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleGoToSelection}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Gerenciar Empresas
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="p-4">
        
        <SidebarMenu className="mt-2">
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
                <SidebarMenuButton asChild size="lg" tooltip="Suporte" isActive={isNavItemActive('/suporte')}>
                    <Link href="/suporte">
                        <LifeBuoy />
                        <span className='group-data-[collapsible=icon]:hidden'>Suporte</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
