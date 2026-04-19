import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLogIn, FiUserPlus, FiSun, FiMoon } from 'react-icons/fi';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth';
import { useTheme } from '@/hooks/use-theme';
import { AUTH_ROUTES, APP_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const publicLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Documentación', to: '/docs' },
] as const;

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  return (
    <header className="border-border/40 bg-background/70 sticky top-0 z-30 border-b backdrop-blur-xl">
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
          <button
            type="button"
            onClick={toggleTheme}
            className="border-border/60 text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground grid h-9 w-9 place-items-center rounded-full border transition"
            aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {resolvedTheme === 'dark' ? (
              <FiSun className="h-4 w-4" />
            ) : (
              <FiMoon className="h-4 w-4" />
            )}
          </button>

          <span aria-hidden="true" className="bg-border/60 mx-1 h-5 w-px" />

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
          className="text-muted-foreground hover:bg-accent hover:text-foreground grid h-10 w-10 place-items-center rounded-md transition md:hidden"
          aria-label="Alternar menú"
          aria-expanded={open}
        >
          {open ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-border/40 bg-background/95 border-t md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="border-border/40 mt-2 flex flex-col gap-2 border-t pt-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground flex h-10 items-center justify-center gap-2 rounded-full border text-sm transition"
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <FiSun className="h-4 w-4" /> Cambiar a claro
                  </>
                ) : (
                  <>
                    <FiMoon className="h-4 w-4" /> Cambiar a oscuro
                  </>
                )}
              </button>
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
