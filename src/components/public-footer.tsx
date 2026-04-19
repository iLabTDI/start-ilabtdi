import { Link } from 'react-router';
import { FiGithub, FiMail } from 'react-icons/fi';
import { BrandMark } from '@/components/brand-mark';
import { siteConfig } from '@/config/site';

export function PublicFooter() {
  return (
    <footer className="border-border/40 bg-card/30 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <BrandMark size="md" withWordmark />
          <p className="text-muted-foreground mt-4 max-w-sm text-sm">
            Template-repo oficial del {siteConfig.lab.name}. Base segura, probada y lista para
            deploy — para construir sobre ella, no junto a ella.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground grid h-9 w-9 place-items-center rounded-md border transition"
              aria-label="GitHub"
            >
              <FiGithub className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.links.support}
              className="border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground grid h-9 w-9 place-items-center rounded-md border transition"
              aria-label="Soporte"
            >
              <FiMail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            Producto
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/#features"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Características
              </Link>
            </li>
            <li>
              <Link to="/#stack" className="text-muted-foreground hover:text-foreground transition">
                Stack
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition">
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            Recursos
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/docs/quickstart"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Quickstart
              </Link>
            </li>
            <li>
              <Link
                to="/docs/decisiones-tecnicas"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Decisiones técnicas
              </Link>
            </li>
            <li>
              <Link
                to="/docs/deploy"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Deploy a GoDaddy
              </Link>
            </li>
            <li>
              <Link
                to="/docs/seguridad"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Seguridad
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-border/40 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.lab.name}. MIT License.
          </p>
          <p className="flex items-center gap-1.5">
            Plantilla por{' '}
            <a
              href="https://github.com/yairhdz24"
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:text-primary font-medium transition"
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
