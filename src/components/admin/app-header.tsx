'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LogOut, Menu, Moon, Sun, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminTheme } from '@/components/ThemeToggle';
import { getPageTitle } from '@/components/admin/nav';

interface AppHeaderProps {
  sessionUsername: string;
  initials: string;
  onMobileOpenChange: (open: boolean) => void;
  onLogout: () => void;
}

export function AppHeader({ sessionUsername, initials, onMobileOpenChange, onLogout }: AppHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <button
        onClick={() => onMobileOpenChange(true)}
        aria-label="Buka menu"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Eluzai Kids · Admin</p>
        <h2 className="truncate font-display text-sm font-bold text-foreground">{getPageTitle(pathname)}</h2>
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Ganti tema"
        className="rounded-lg p-2 text-muted-foreground transition-all hover:rotate-12 hover:bg-muted hover:text-foreground"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-muted">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src="/images/logo.webp" alt={sessionUsername} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground sm:block">
              {sessionUsername}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{sessionUsername}</span>
            <span className="text-xs font-normal text-muted-foreground">Administrator</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/settings" className="cursor-pointer">
              <UserCircle className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/" target="_blank" className="cursor-pointer">
              <ExternalLink className="h-4 w-4" />
              Lihat situs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}