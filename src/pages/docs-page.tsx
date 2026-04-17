import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import {
  FiMenu,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiBook,
  FiCheckCircle,
} from 'react-icons/fi';
import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { DocSidebar } from '@/features/docs/components/doc-sidebar';
import { DocViewer } from '@/features/docs/components/doc-viewer';
import {
  docSectionsBySlug,
  flatDocSections,
  docGroups,
} from '@/features/docs/docs-config';
import { cn } from '@/lib/utils';

export function DocsIndexRedirect() {
  const first = flatDocSections[0];
  if (!first) return null;
  return <Navigate to={`/docs/${first.slug}`} replace />;
}

export function DocsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const section = slug ? docSectionsBySlug[slug] : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMobileNavOpen(false);
  }, [slug]);

  if (!section) {
    return <DocsNotFound />;
  }

  const flat = flatDocSections;
  const idx = flat.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? flat[idx - 1] : undefined;
  const next = idx < flat.length - 1 ? flat[idx + 1] : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav />

      {/* Barra mobile sticky con botón "Índice" */}
      <div className="sticky top-16 z-20 flex items-center gap-2 border-b border-border/40 bg-background/85 px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground active:scale-[0.98]"
          aria-label="Abrir navegación de docs"
        >
          <FiMenu className="h-4 w-4" />
          Índice
        </button>
        <span className="truncate text-xs text-muted-foreground/70">
          {section.title}
        </span>
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        {/* Sidebar desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border/40 py-8 pr-6 lg:flex lg:flex-col xl:w-72">
          <DocSidebar />
        </aside>

        {/* Drawer mobile */}
        <MobileDocsDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <main className="w-full min-w-0 pb-24 pt-6 sm:pb-32 sm:pt-10 lg:px-10 lg:pb-40 lg:pt-10">
          <DocViewer section={section} />

          {/* Prev/next — stack vertical en mobile, horizontal en sm+ */}
          <nav className="mt-12 flex flex-col gap-3 border-t border-border/40 pt-8 sm:mt-16 sm:flex-row sm:justify-between">
            {prev ? (
              <Link
                to={`/docs/${prev.slug}`}
                className="group flex flex-1 items-center gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:border-primary/40 active:scale-[0.99]"
              >
                <FiArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Anterior</p>
                  <p className="truncate text-sm font-medium">{prev.title}</p>
                </div>
              </Link>
            ) : (
              <span className="hidden sm:block sm:flex-1" />
            )}
            {next ? (
              <Link
                to={`/docs/${next.slug}`}
                className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-border/60 p-4 text-right transition-colors hover:border-primary/40 active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Siguiente</p>
                  <p className="truncate text-sm font-medium">{next.title}</p>
                </div>
                <FiArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            ) : (
              <span className="hidden sm:block sm:flex-1" />
            )}
          </nav>

          {/* Cierre visual cuando es la última doc */}
          {!next && (
            <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-8 text-center sm:mt-16 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <FiCheckCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Llegaste al final de la documentación.</p>
              <p className="max-w-md text-xs text-muted-foreground">
                ¿Algo quedó confuso o falta? Abre un PR con la mejora — la guía
                solo vale si se mantiene viva.
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/docs/quickstart"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-4 text-sm transition hover:border-primary/40 hover:text-foreground"
                >
                  Volver al quickstart
                </Link>
                <Link
                  to="/"
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm text-primary-foreground shadow-sm shadow-primary/20 transition hover:shadow-md hover:shadow-primary/30"
                >
                  Ir al inicio
                  <FiArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}

function DocsNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <FiBook className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Sección no encontrada</h1>
            <p className="text-sm text-muted-foreground">
              La página que buscas no existe o fue renombrada.
            </p>
          </div>
          <div className="grid gap-5 text-left">
            {docGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
                <ul className="space-y-1.5">
                  {group.sections.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to={`/docs/${s.slug}`}
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

interface MobileDocsDrawerProps {
  open: boolean;
  onClose: () => void;
}

function MobileDocsDrawer({ open, onClose }: MobileDocsDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88%] flex-col border-r border-border/60 bg-card shadow-2xl transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-border/40 p-4">
          <p className="text-sm font-semibold">Documentación</p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Cerrar"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <DocSidebar onNavigate={onClose} className="h-full" />
        </div>
      </aside>
    </>
  );
}
