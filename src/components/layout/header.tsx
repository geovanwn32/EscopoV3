'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Bell, ChevronsUpDown, Check, PlusCircle, Building2, Search, Shield, LayoutGrid, Settings, LogOut, Building } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCompany } from '@/hooks/use-company';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { useState } from 'react';

export default function Header() {
  const avatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-9 w-64 bg-muted border-none" />
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <CompanySwitcher />
        <Notifications />
        <UserMenu avatar={avatar} />
      </div>
    </header>
  );
}

function CompanySwitcher() {
  const [open, setOpen] = useState(false)
  const { companies, currentCompany, switchCompany } = useCompany()
  const router = useRouter();

  const activeCompany = companies.find(c => c.id === currentCompany)
  const companyDisplayName = activeCompany?.data?.nomeFantasia || activeCompany?.name;
  
  if (!activeCompany) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between hidden sm:flex"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className='h-6 w-6'>
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                    {companyDisplayName ? companyDisplayName.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
            </Avatar>
            <span className="truncate">{companyDisplayName}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandList>
            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    switchCompany(company.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentCompany === company.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {company.data?.nomeFantasia || company.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
                <CommandItem onSelect={() => { router.push('/selecionar-empresa'); setOpen(false); }}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Gerenciar Empresas
                </CommandItem>
                <CommandItem onSelect={() => { router.push('/selecionar-empresa'); setOpen(false); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Nova Empresa
                </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


function Notifications() {
  // Mock data for notifications. In a real app, this would come from a state or API.
  const notifications = [
    { id: 1, title: 'Nova atualização disponível', description: 'Versão 3.1.0 já pode ser instalada.' },
    { id: 2, title: 'Fatura #1234 vence amanhã', description: 'Cliente: Soluções Inovadoras S.A.' },
    { id: 3, title: 'XML de Fornecedor XYZ importado', description: 'NF-e 56789 processada com sucesso.' },
  ];
  const hasUnread = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {hasUnread && <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>}
            <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className='flex justify-between items-center'>
            Notificações
            <Badge variant="secondary">{notifications.length}</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map(n => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1">
              <p className="font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.description}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
            Nenhuma notificação nova.
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className='justify-center'>
            <Link href="#">Ver todas as notificações</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu({ avatar }: { avatar?: { imageUrl: string; imageHint: string } }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
            {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} alt="Avatar do usuário" />}
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Geovani Nunes</p>
            <p className="text-xs leading-none text-muted-foreground">geovaniwn@gmail.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes">
            <Settings className='mr-2'/>
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <LogOut className='mr-2'/>
            Sair
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
