import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { BrandMark } from '@/components/common/brand-mark';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/hooks/use-session';
import { AUTH_ROUTES, APP_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const publicLinks = [
  { label: 'Quickstart', to: '/docs/quickstart' },
  { label: 'Documentación', to: '/docs' },
  { label: 'Stack', to: '/#stack' },
] as const;

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="transition hover:opacity-90">
          <BrandMark size="sm" withWordmark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm transition-colors',
                  isActive && link.to === '/'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link to={APP_ROUTES.appHome}>Entrar al lab</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={AUTH_ROUTES.login}>
                  <FiLogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to={AUTH_ROUTES.register}>
                  <FiUserPlus className="h-4 w-4" />
                  Crear cuenta
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Alternar menú"
          aria-expanded={open}
        >
          {open ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/40 pt-3">
              {isAuthenticated ? (
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to={APP_ROUTES.appHome}>Entrar al lab</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to={AUTH_ROUTES.login}>
                      <FiLogIn className="h-4 w-4" />
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to={AUTH_ROUTES.register}>
                      <FiUserPlus className="h-4 w-4" />
                      Crear cuenta
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
