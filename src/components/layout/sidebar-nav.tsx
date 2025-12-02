
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
  { href: '/cadastros', label: 'Cadastros', icon: Archive },
  { href: '/conectividade', label: 'Conectividade', icon: Plug },
  { href: '/utilitarios', label: 'Utilitários', icon: Wrench },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];


export function SidebarNav() {
  const pathname = usePathname();

  const isNavItemActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <div className='flex items-center gap-3 mb-8 px-4'>
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">EscopoV3</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link href={item.href} key={item.label}>
            <Button
              variant={isNavItemActive(item.href) ? 'secondary' : 'ghost'}
              className="w-full justify-start h-12"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Separator className="my-4" />
        <Button variant="ghost" className="w-full justify-start">
            <LifeBuoy className="mr-3 h-5 w-5" />
            Suporte
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/minha-empresa">
                <Building className="mr-3 h-5 w-5" />
                Minha Empresa
            </Link>
        </Button>
      </div>
    </div>
  );
}
