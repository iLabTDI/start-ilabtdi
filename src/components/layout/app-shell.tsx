import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { DemoBanner } from '@/components/common/demo-banner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { APP_STORAGE_KEYS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AppShell() {
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    APP_STORAGE_KEYS.sidebarCollapsed,
    false
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />

      <div
        className={cn(
          'flex min-h-screen flex-1 flex-col transition-[padding] duration-300',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        )}
      >
        <DemoBanner variant="strip" />
        <Header onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
