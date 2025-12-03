
'use client';

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
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useSidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useCompany } from '@/hooks/use-company';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fiscal', label: 'Fiscal', icon: FileText },
  { href: '/pessoal', label: 'Pessoal', icon: Users },
  { href: '/contabil', label: 'Contábil', icon: Book },
  { href: '/financeiro', label: 'Financeiro', icon: Banknote },
  { href: '/parceiros', label: 'Cadastros', icon: Archive },
  { href: '/conectividade', label: 'Conectividade', icon: Plug },
  { href: '/utilitarios', label: 'Utilitários', icon: Wrench },
  // { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

const cadastroItems: NavItem[] = [
    { href: '/parceiros', label: 'Parceiros', icon: Archive },
    { href: '/produtos', label: 'Produtos', icon: Archive },
    { href: '/servicos', label: 'Serviços', icon: Archive },
    { href: '/funcionarios', label: 'Funcionários', icon: Archive },
    { href: '/socios', label: 'Sócios', icon: Archive },
    { href: '/aliquotas', label: 'Alíquotas', icon: Archive },
    { href: '/rubricas', label: 'Rubricas', icon: Archive },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { companies, currentCompany } = useCompany();

  const activeCompany = companies.find(c => c.id === currentCompany);

  const isNavItemActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    if (href === '/parceiros') {
        const cadastroPaths = ['/parceiros', '/produtos', '/servicos', '/funcionarios', '/socios', '/aliquotas', '/rubricas'];
        return cadastroPaths.some(p => pathname.startsWith(p));
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
      <Link href="/selecionar-empresa">
        <div className={cn(
            'flex items-center gap-3 mb-8 px-2 transition-all',
            !open && "justify-center"
        )}>
          <Avatar className='h-10 w-10'>
              <AvatarImage src={activeCompany?.data?.logo || ''}/>
              <AvatarFallback className='bg-primary/10 text-primary'>
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
          </Avatar>
          
          <div className={cn("flex flex-col transition-all duration-300", !open && "w-0 opacity-0")}>
            <span className="font-bold text-md tracking-tight text-foreground truncate">{activeCompany?.data?.nomeFantasia || activeCompany?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{activeCompany?.data?.cnpj}</span>
          </div>

        </div>
      </Link>

      <nav className="flex-1 space-y-2">
        <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
            <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                    <Link href={item.href}>
                        <Button
                        variant={isNavItemActive(item.href) ? 'secondary' : 'ghost'}
                        className={cn("w-full h-12 justify-start", !open && "justify-center")}
                        >
                        <item.icon className="h-5 w-5" />
                        <span className={cn("ml-3 transition-all", !open && "hidden")}>{item.label}</span>
                        </Button>
                    </Link>
                </TooltipTrigger>
                {!open && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
            ))}
        </TooltipProvider>
      </nav>

      <div className="mt-auto space-y-2">
        <Separator className="my-2" />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className={cn("w-full h-12 justify-start", !open && "justify-center")}>
                  <LifeBuoy className="h-5 w-5" />
                  <span className={cn("ml-3 transition-all", !open && "hidden")}>Suporte</span>
              </Button>
            </TooltipTrigger>
            {!open && <TooltipContent side="right">Suporte</TooltipContent>}
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/configuracoes">
                  <Button variant={isNavItemActive('/configuracoes') ? 'secondary' : 'ghost'} className={cn("w-full h-12 justify-start", !open && "justify-center")}>
                      <Settings className="h-5 w-5" />
                      <span className={cn("ml-3 transition-all", !open && "hidden")}>Configurações</span>
                  </Button>
              </Link>
            </TooltipTrigger>
            {!open && <TooltipContent side="right">Configurações</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
