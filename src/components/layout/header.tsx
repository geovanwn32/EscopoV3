'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Bell, ChevronsUpDown, Check, PlusCircle, Building2, Search, Shield, LayoutGrid } from 'lucide-react';
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
        <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
        </Button>
        <UserMenu avatar={avatar} />
      </div>
    </header>
  );
}

function CompanySwitcher() {
  const { companies, currentCompany, switchCompany, addCompany } = useCompany();
  const router = useRouter();
  const activeCompany = companies.find(c => c.id === currentCompany);

  const handleCompanySwitch = (companyId: number) => {
    switchCompany(companyId);
  };
  
  const handleGoToSelection = () => {
    router.push('/selecionar-empresa');
  };

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            className="w-[200px] justify-between"
          >
            {activeCompany ? activeCompany.name : "Selecione a empresa..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
            <CommandInput placeholder="Buscar empresa..." />
            <CommandList>
                <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                <CommandGroup>
                    {companies.map((company) => (
                        <CommandItem
                            key={company.id}
                            value={company.name}
                            onSelect={() => handleCompanySwitch(company.id)}
                            className="cursor-pointer"
                        >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                currentCompany === company.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {company.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                    <CommandItem onSelect={addCompany} className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Empresa
                    </CommandItem>
                    <CommandItem onSelect={handleGoToSelection} className="cursor-pointer">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Ver Todas as Empresas
                    </CommandItem>
                     <CommandItem onSelect={handleGoToAdmin} className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Permissões Avançadas
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
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
            <p className="text-sm font-medium leading-none">Seu Nome</p>
            <p className="text-xs leading-none text-muted-foreground">seu@email.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/minha-empresa">
            Minha Empresa
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes">
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">Sair</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
