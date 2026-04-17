import { Link } from 'react-router';
import { FiGithub, FiMail } from 'react-icons/fi';
import { BrandMark } from '@/components/common/brand-mark';
import { siteConfig } from '@/config/site';

export function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <BrandMark size="md" withWordmark />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Template-repo oficial del {siteConfig.lab.name}. Base segura, probada y lista para
            deploy — para construir sobre ella, no junto a ella.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="grid h-9 w-9 place-items-center rounded-md border border-border/60 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="GitHub"
            >
              <FiGithub className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.links.support}
              className="grid h-9 w-9 place-items-center rounded-md border border-border/60 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Soporte"
            >
              <FiMail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Producto
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/#features" className="text-muted-foreground transition hover:text-foreground">
                Características
              </Link>
            </li>
            <li>
              <Link to="/#stack" className="text-muted-foreground transition hover:text-foreground">
                Stack
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-muted-foreground transition hover:text-foreground">
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recursos
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/docs/quickstart" className="text-muted-foreground transition hover:text-foreground">
                Quickstart
              </Link>
            </li>
            <li>
              <Link to="/docs/decisiones-tecnicas" className="text-muted-foreground transition hover:text-foreground">
                Decisiones técnicas
              </Link>
            </li>
            <li>
              <Link to="/docs/deploy" className="text-muted-foreground transition hover:text-foreground">
                Deploy a GoDaddy
              </Link>
            </li>
            <li>
              <Link to="/docs/seguridad" className="text-muted-foreground transition hover:text-foreground">
                Seguridad
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {siteConfig.lab.name}. MIT License.</p>
          <p className="flex items-center gap-1.5">
            Plantilla por{' '}
            <a
              href="https://github.com/yairhdz24"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground transition hover:text-primary"
            >
              Yair Hernández
            </a>
            <span className="text-muted-foreground/50">·</span>
            <span>v{siteConfig.version}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
