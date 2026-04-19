import { NavLink } from 'react-router';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { mainNav } from '@/config/nav';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'border-border/60 bg-card/40 fixed inset-y-0 left-0 z-30 hidden border-r backdrop-blur-xl transition-[width] duration-300 lg:flex lg:flex-col',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div
        className={cn(
          'border-border/40 flex h-16 items-center border-b px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <BrandMark size="sm" withWordmark={!collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {mainNav.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <p className="text-muted-foreground/70 mb-2 px-3 text-xs font-medium tracking-wider uppercase">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          'text-muted-foreground hover:bg-accent hover:text-foreground',
                          isActive && 'bg-accent text-foreground',
                          collapsed && 'justify-center px-0'
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-border/40 border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('text-muted-foreground w-full gap-2', collapsed && 'px-0')}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
              <span>Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
