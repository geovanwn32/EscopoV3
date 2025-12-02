'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Settings as SettingsIcon } from 'lucide-react';
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NAV_TITLES } from '@/lib/nav-titles';

export default function Header() {
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
  const title = NAV_TITLES[pathname] || 'EscopoV3';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      <UserMenu avatar={avatar} />
    </header>
  );
}

function UserMenu({ avatar }: { avatar?: { imageUrl: string; imageHint: string } }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border">
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
            <p className="text-sm font-medium leading-none">Usuário Padrão</p>
            <p className="text-xs leading-none text-muted-foreground">usuario@exemplo.com</p>
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
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>Configurações</span>
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
