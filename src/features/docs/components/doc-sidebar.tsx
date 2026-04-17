import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router';
import { FiSearch } from 'react-icons/fi';
import { Input } from '@/components/ui/input';
import { docGroups } from '@/features/docs/docs-config';
import { cn } from '@/lib/utils';

interface DocSidebarProps {
  baseHref?: string;
  onNavigate?: () => void;
  className?: string;
}

export function DocSidebar({ baseHref = '/docs', onNavigate, className }: DocSidebarProps) {
  const [query, setQuery] = useState('');
  const { pathname } = useLocation();

  useEffect(() => {
    onNavigate?.();
    // solo para cerrar el drawer cuando cambia la ruta desde fuera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const normalized = query.trim().toLowerCase();

  const filteredGroups = docGroups
    .map((g) => ({
      ...g,
      sections: g.sections.filter(
        (s) =>
          !normalized ||
          s.title.toLowerCase().includes(normalized) ||
          s.summary.toLowerCase().includes(normalized) ||
          s.content.toLowerCase().includes(normalized)
      ),
    }))
    .filter((g) => g.sections.length > 0);

  return (
    <aside className={cn('flex flex-col', className)}>
      <div className="relative mb-5">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar en la documentación…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <nav className="flex-1 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <p className="px-3 text-sm text-muted-foreground">Sin resultados.</p>
        ) : (
          filteredGroups.map((group) => {
            const Icon = group.icon;
            return (
            <div key={group.label} className="mb-6">
              <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                <Icon className="h-3 w-3" />
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.sections.map((section) => (
                  <li key={section.slug}>
                    <NavLink
                      to={`${baseHref}/${section.slug}`}
                      end
                      onClick={() => onNavigate?.()}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2 text-sm transition-colors',
                          'text-muted-foreground hover:bg-accent hover:text-foreground',
                          isActive && 'bg-accent text-foreground'
                        )
                      }
                    >
                      {section.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
