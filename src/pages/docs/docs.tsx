import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { FiMenu, FiX, FiArrowRight, FiArrowLeft, FiBook, FiCheckCircle } from 'react-icons/fi';
import { PublicNav } from '@/components/public-nav';
import { PublicFooter } from '@/components/public-footer';
import { DocSidebar } from '@/components/doc-sidebar';
import { DocViewer } from '@/components/doc-viewer';
import { docSectionsBySlug, flatDocSections, docGroups } from '@/pages/docs/docs-config';
import { cn } from '@/lib/utils';

export function DocsIndexRedirect() {
  const first = flatDocSections[0];
  if (!first) return null;
  return <Navigate to={`/docs/${first.slug}`} replace />;
}

export function Docs() {
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
    <div className="bg-background flex min-h-screen flex-col">
      <PublicNav />

      {/* Barra mobile sticky con botón "Índice" */}
      <div className="border-border/40 bg-background/85 sticky top-16 z-20 flex items-center gap-2 border-b px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="border-border/60 bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition active:scale-[0.98]"
          aria-label="Abrir navegación de docs"
        >
          <FiMenu className="h-4 w-4" />
          Índice
        </button>
        <span className="text-muted-foreground/70 truncate text-xs">{section.title}</span>
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        {/* Sidebar desktop */}
        <aside className="border-border/40 sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r py-8 pr-6 lg:flex lg:flex-col xl:w-72">
          <DocSidebar />
        </aside>

        {/* Drawer mobile */}
        <MobileDocsDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <main className="w-full min-w-0 pt-6 pb-24 sm:pt-10 sm:pb-32 lg:px-10 lg:pt-10 lg:pb-40">
          <DocViewer section={section} />

          {/* Prev/next — stack vertical en mobile, horizontal en sm+ */}
          <nav className="border-border/40 mt-12 flex flex-col gap-3 border-t pt-8 sm:mt-16 sm:flex-row sm:justify-between">
            {prev ? (
              <Link
                to={`/docs/${prev.slug}`}
                className="group border-border/60 hover:border-primary/40 flex flex-1 items-center gap-3 rounded-xl border p-4 transition-colors active:scale-[0.99]"
              >
                <FiArrowLeft className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
                    Anterior
                  </p>
                  <p className="truncate text-sm font-medium">{prev.title}</p>
                </div>
              </Link>
            ) : (
              <span className="hidden sm:block sm:flex-1" />
            )}
            {next ? (
              <Link
                to={`/docs/${next.slug}`}
                className="group border-border/60 hover:border-primary/40 flex flex-1 items-center justify-end gap-3 rounded-xl border p-4 text-right transition-colors active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
                    Siguiente
                  </p>
                  <p className="truncate text-sm font-medium">{next.title}</p>
                </div>
                <FiArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
              </Link>
            ) : (
              <span className="hidden sm:block sm:flex-1" />
            )}
          </nav>

          {/* Cierre visual cuando es la última doc */}
          {!next && (
            <div className="border-border/60 bg-card/40 mt-12 flex flex-col items-center gap-3 rounded-2xl border p-8 text-center sm:mt-16 sm:p-10">
              <div className="border-primary/30 bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full border">
                <FiCheckCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Llegaste al final de la documentación.</p>
              <p className="text-muted-foreground max-w-md text-xs">
                ¿Algo quedó confuso o falta? Abre un PR con la mejora — la guía solo vale si se
                mantiene viva.
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/docs/quickstart"
                  className="border-border/60 bg-background/60 hover:border-primary/40 hover:text-foreground inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-sm transition"
                >
                  Volver al quickstart
                </Link>
                <Link
                  to="/"
                  className="bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm shadow-sm transition hover:shadow-md"
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
    <div className="bg-background flex min-h-screen flex-col">
      <PublicNav />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="border-primary/30 bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full border">
            <FiBook className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Sección no encontrada</h1>
            <p className="text-muted-foreground text-sm">
              La página que buscas no existe o fue renombrada.
            </p>
          </div>
          <div className="grid gap-5 text-left">
            {docGroups.map((group) => (
              <div key={group.label}>
                <p className="text-muted-foreground/70 mb-2 text-xs font-medium tracking-wider uppercase">
                  {group.label}
                </p>
                <ul className="space-y-1.5">
                  {group.sections.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to={`/docs/${s.slug}`}
                        className="text-primary text-sm underline-offset-4 hover:underline"
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
          'border-border/60 bg-card fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88%] flex-col border-r shadow-2xl transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-border/40 flex items-center justify-between border-b p-4">
          <p className="text-sm font-semibold">Documentación</p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:bg-accent hover:text-foreground grid h-9 w-9 place-items-center rounded-md transition"
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
