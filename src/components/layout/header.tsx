
'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Bell, ChevronsUpDown, Check, PlusCircle, Building2, Search, Settings, LogOut, AlertTriangle, ArrowRightCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCompany } from '@/hooks/use-company';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useState, useMemo, useEffect } from 'react';
import { NAV_TITLES } from '@/lib/nav-titles';
import { Conta } from '@/types/financeiro';
import { useSidebar } from '../ui/sidebar';
import { useAuth, useUser } from '@/firebase';

export default function Header() {
  const pathname = usePathname();
  const pageTitle = NAV_TITLES[pathname] || "Dashboard";
  const { open, setOpen } = useSidebar();


  return (
    <header className="sticky top-0 z-30 flex h-20 w-full shrink-0 items-center justify-between border-b bg-background/95 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="h-10 w-10">
            {open ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
      </div>
      <div className='flex flex-1 items-center justify-end gap-4'>
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar..." className="pl-10 w-full bg-card border-none" />
        </div>
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}

function Notifications() {
  const { useScopedData } = useCompany();
  const [contasReceber] = useScopedData<Conta[]>('financeiro-contas-a-receber', []);
  
  const notifications = useMemo(() => {
    return contasReceber
      .filter(c => c.status === 'Atrasado')
      .map(c => ({
        id: `cr-${c.id}`,
        title: 'Conta a receber atrasada',
        description: `${c.description} - ${c.partnerName}`,
        link: '/financeiro/contas-a-receber',
      }));
  }, [contasReceber]);

  const hasUnread = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <Bell className="h-5 w-5" />
            {hasUnread && <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>}
            <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className='flex justify-between items-center'>
            Notificações
            {hasUnread && <Badge variant="secondary">{notifications.length}</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map(n => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href={n.link} className="flex items-start gap-3">
                 <AlertTriangle className="h-4 w-4 text-destructive mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
            Nenhuma notificação nova.
          </div>
        )}
        {hasUnread && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className='justify-center'>
                    <Link href="/dashboard">Ver todas no dashboard</Link>
                </DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu() {
  const { user } = useUser();
  const auth = useAuth();
  const [activeProfile, setActiveProfile] = useState<{name: string, email: string, isAdmin: boolean} | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const profileString = sessionStorage.getItem('user-profile');
        if (profileString) {
            try {
                setActiveProfile(JSON.parse(profileString));
            } catch (e) {
                console.error("Failed to parse user profile from session storage", e);
            }
        }
    }
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    // Clear all session and local storage related to the user/company
    localStorage.removeItem('currentCompany');
    sessionStorage.removeItem('user-profile');
    window.location.href = '/login'; // Force a full reload to the login page
  };

  if (!user || !activeProfile) {
    return (
       <Avatar className="h-10 w-10 border-2 border-transparent">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer">
            <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={activeProfile.name} />}
              <AvatarFallback>
                {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : <User />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
                <p className="text-sm font-medium leading-none">{activeProfile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {activeProfile.isAdmin ? 'Administrador' : 'Usuário'}
                </p>
            </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{activeProfile.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{activeProfile.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes">
            <Settings className='mr-2 h-4 w-4'/>
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/minha-empresa">
            <Building2 className='mr-2 h-4 w-4'/>
            Minha Empresa
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className='mr-2 h-4 w-4'/>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
