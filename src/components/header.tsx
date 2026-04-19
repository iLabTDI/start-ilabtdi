import { Link, useLocation } from 'react-router';
import { LogOut, Menu, Monitor, Moon, Settings, Sun, User } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/hooks/use-theme';
import { breadcrumbLabels } from '@/config/nav';
import { getInitials } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/constants';
import { THEME_OPTIONS, type ThemeMode } from '@/config/theme';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.ok) {
      toast.success('Sesión cerrada');
    } else {
      toast.error(result.error);
    }
  };

  const segments = pathname.split('/').filter(Boolean);

  const initials = getInitials(
    typeof user?.user_metadata?.['full_name'] === 'string'
      ? user.user_metadata['full_name']
      : user?.email
  );

  return (
    <header className="border-border/40 bg-background/70 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </Button>

      <nav aria-label="Migas de pan" className="text-muted-foreground flex-1 text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to={APP_ROUTES.appHome} className="hover:text-foreground transition">
              Inicio
            </Link>
          </li>
          {segments.map((seg, i) => {
            const last = i === segments.length - 1;
            const to = '/' + segments.slice(0, i + 1).join('/');
            const label = breadcrumbLabels[seg] ?? seg;
            return (
              <li key={to} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-border">
                  /
                </span>
                {last ? (
                  <span className="text-foreground">{label}</span>
                ) : (
                  <Link to={to} className="hover:text-foreground transition">
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Cambiar tema">
            <Sun className="h-4 w-4 dark:hidden" strokeWidth={1.5} />
            <Moon className="hidden h-4 w-4 dark:block" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tema</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
            {THEME_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                <ThemeIcon mode={opt.value} />
                <span className="ml-2">{opt.label}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2"
            aria-label="Menú de usuario"
          >
            <Avatar className="border-border/60 h-9 w-9 border">
              {typeof user?.user_metadata?.['avatar_url'] === 'string' && (
                <AvatarImage src={user.user_metadata['avatar_url']} alt={user.email ?? 'avatar'} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[14rem]">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">
                {typeof user?.user_metadata?.['full_name'] === 'string'
                  ? user.user_metadata['full_name']
                  : 'Usuario'}
              </span>
              <span className="text-muted-foreground text-xs font-normal tracking-normal normal-case">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={APP_ROUTES.profile}>
              <User className="h-4 w-4" strokeWidth={1.5} />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={APP_ROUTES.settings}>
              <Settings className="h-4 w-4" strokeWidth={1.5} />
              <span>Configuración</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              void handleSignOut();
            }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === 'light') return <Sun className="h-4 w-4" strokeWidth={1.5} />;
  if (mode === 'dark') return <Moon className="h-4 w-4" strokeWidth={1.5} />;
  return <Monitor className="h-4 w-4" strokeWidth={1.5} />;
}
