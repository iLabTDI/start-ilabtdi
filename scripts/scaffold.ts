#!/usr/bin/env tsx
/**
 * scaffold.ts — limpia el template para iniciar un proyecto nuevo.
 *
 *   pnpm scaffold               # interactivo
 *   pnpm scaffold --force       # sin confirmación
 *   pnpm scaffold --dry-run     # muestra qué haría sin tocar nada
 *
 * Qué hace:
 *   1. Elimina la sección de documentación del template (docs públicas).
 *   2. Elimina la carpeta `packages/` · solo sirve para publicar a npm.
 *   3. Elimina los scripts del template que ya cumplieron (bootstrap, scaffold).
 *   4. Si el backend elegido NO es PHP, elimina `backend/` y scripts de DB.
 *   5. Limpia imports y entradas del router, nav y footer que hacían referencia.
 *   6. Se auto-elimina.
 *
 * Idempotente: correrlo dos veces no rompe nada.
 */

import { existsSync, readFileSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { stdin, stdout } from 'node:process';
import { log, ROOT } from './_shared.js';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const FORCE = args.has('--force') || args.has('-f');

const DEPS_TO_REMOVE = ['react-markdown', 'remark-gfm', 'rehype-slug'];

/* ─── Detecta el backend elegido leyendo .env ─── */

function detectBackend(): 'supabase' | 'php' | 'demo' {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return 'supabase';
  const raw = readFileSync(envPath, 'utf8');
  const match = raw.match(/^VITE_AUTH_BACKEND=(\w+)$/m);
  const value = match?.[1]?.trim();
  if (value === 'php' || value === 'demo') return value;
  return 'supabase';
}

const BACKEND = detectBackend();

/* ─── Mutaciones: limpiar referencias a docs en archivos que quedan ─── */

interface Mutation {
  file: string;
  description: string;
  mutate: (content: string) => string;
}

const MUTATIONS: Mutation[] = [
  {
    file: 'src/router.tsx',
    description: 'quitar rutas /docs',
    mutate: (c) =>
      c
        .replace(
          /import\s+\{\s*Docs,\s*DocsIndexRedirect\s*\}\s+from\s+'@\/pages\/docs\/docs';\s*\n/,
          ''
        )
        .replace(
          /\s*\/\/ Documentación[\s\S]*?\{ path: 'docs\/:slug', element: <Docs \/> \},\s*/,
          '\n'
        ),
  },
  {
    file: 'src/config/nav.ts',
    description: 'quitar item "Documentación" del sidebar',
    mutate: (c) =>
      c
        .replace(
          /\s*\{\s*label:\s*'Documentación',\s*href:\s*APP_ROUTES\.docs,\s*icon:\s*BookOpen\s*\},\s*/,
          '\n      '
        )
        .replace(/\bBookOpen\s*,\s*/g, '')
        .replace(/,\s*BookOpen\b/g, '')
        .replace(/\s*docs:\s*'Documentación',\s*/g, '\n  '),
  },
  {
    file: 'src/lib/constants.ts',
    description: 'quitar APP_ROUTES.docs',
    mutate: (c) => c.replace(/\s*docs:\s*'\/docs',\s*/g, '\n  '),
  },
  {
    file: 'src/components/public-nav.tsx',
    description: 'quitar link "Documentación" del nav público',
    mutate: (c) => c.replace(/\s*\{\s*label:\s*'Documentación',\s*to:\s*'\/docs'\s*\},?\s*/, '\n'),
  },
  {
    file: 'src/components/public-footer.tsx',
    description: 'quitar columna "Recursos" del footer',
    mutate: (c) =>
      c.replace(/\s*<div>\s*<p[^>]*>\s*Recursos[\s\S]*?<\/ul>\s*<\/div>\s*/, '\n        '),
  },
  {
    file: 'src/pages/home/app-home.tsx',
    description: 'quitar shortcut "Documentación" del home interno',
    mutate: (c) =>
      c
        .replace(
          /\s*\{\s*icon:\s*FiBookOpen,\s*title:\s*'Documentación',[\s\S]*?to:\s*APP_ROUTES\.docs,?\s*\},?\s*/,
          '\n  '
        )
        .replace(/,?\s*FiBookOpen\s*,?/, '')
        .replace(
          /pasa por la\s*<Link[^>]*to=\{APP_ROUTES\.docs\}[^>]*>[^<]*<\/Link>[\s\S]*?—\s*te\s+ahorrará[\s\S]*?\./,
          'revisa la estructura del proyecto — te ahorrará tiempo en decisiones que ya están tomadas.'
        ),
  },
  {
    file: 'src/pages/home/public-home.tsx',
    description: 'quitar botón "Ver decisiones técnicas" de la landing',
    mutate: (c) =>
      c.replace(
        /\s*<div className="mt-6">\s*<Button asChild variant="outline">[\s\S]*?Ver decisiones técnicas[\s\S]*?<\/Button>\s*<\/div>/,
        ''
      ),
  },
];

/* ─── Main ─── */

async function main(): Promise<void> {
  log('info', `scaffold · iLab TDI${DRY ? ' [dry-run]' : ''}  ·  backend: ${BACKEND}`);

  printPlan();

  if (!DRY && !FORCE) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(
      '\n¿Proceder con la limpieza? Esta acción no es reversible. [y/N] '
    );
    rl.close();
    if (answer.toLowerCase() !== 'y') {
      log('warn', 'Cancelado.');
      return;
    }
  }

  // 1. Mutar archivos que quedan
  for (const m of MUTATIONS) applyMutation(m);

  // 2. Borrar pages y components de docs
  removeDir('src/pages/docs');
  removeFile('src/components/doc-sidebar.tsx');
  removeFile('src/components/doc-viewer.tsx');

  // 2b. Sustituir la landing pública por un redirect simple al login.
  //     Y eliminar el nav/footer público (solo servían para la landing).
  //     Si el estudiante quiere una landing, la diseña desde cero.
  replaceWithRedirectHome();
  removeFile('src/components/public-nav.tsx');
  removeFile('src/components/public-footer.tsx');

  // 3. Borrar carpeta `packages/` · solo sirve para publicar a npm
  removeDir('packages');

  // 4. Si el backend NO es PHP, quitar backend/ y sus scripts
  if (BACKEND !== 'php') {
    removeDir('backend');
    removeFile('scripts/db-setup.ts');
    removeFile('scripts/db-user.ts');
    removeFile('scripts/generate-backend-config.mjs');
    removePackageJsonScripts(['db:setup', 'db:user']);
  }

  // 5. Borrar los scripts del template que ya cumplieron
  //    (bootstrap, scaffold, _shared — no se necesitan en el proyecto final)
  if (!DRY) {
    removePackageJsonScripts(['bootstrap', 'scaffold']);
  }
  removeFile('scripts/bootstrap.ts');
  removeFile('scripts/_shared.ts');

  // 6. Desinstalar deps de docs (react-markdown, etc.)
  if (!DRY) uninstallDeps();

  // 7. Auto-eliminar este script
  if (!DRY) {
    try {
      unlinkSync(resolve(ROOT, 'scripts/scaffold.ts'));
      log('ok', 'scripts/scaffold.ts (self) removido');
    } catch {
      /* noop */
    }

    // 8. Si scripts/ quedó vacío, borrarlo
    try {
      rmSync(resolve(ROOT, 'scripts'), { recursive: true, force: false });
      log('ok', 'scripts/ eliminado (quedó vacío)');
    } catch {
      /* sigue teniendo archivos · lo dejamos */
    }
  }

  log('ok', 'Scaffold completado.');
  log('info', 'Siguiente paso:\n    git add . && git commit -m "chore: init"\n    pnpm dev');
}

function printPlan(): void {
  console.log('\nVoy a:');
  console.log('  • eliminar pages de docs  (src/pages/docs/)');
  console.log('  • eliminar docs en components (doc-sidebar, doc-viewer)');
  console.log('  • eliminar packages/  (solo sirve para publicar a npm)');
  if (BACKEND !== 'php') {
    console.log(`  • eliminar backend/ y scripts de DB  (backend elegido: ${BACKEND})`);
  } else {
    console.log('  • mantener backend/ + db-setup, db-user  (backend: PHP)');
  }
  console.log('  • eliminar bootstrap.ts y scaffold.ts  (ya cumplieron)');
  console.log('  • limpiar archivos:');
  for (const m of MUTATIONS) console.log(`      - ${m.file}  (${m.description})`);
  console.log(`  • desinstalar deps: ${DEPS_TO_REMOVE.join(', ')}`);
}

function applyMutation(m: Mutation): void {
  const path = resolve(ROOT, m.file);
  if (!existsSync(path)) {
    log('warn', `${m.file} — no existe, saltado`);
    return;
  }
  const before = readFileSync(path, 'utf8');
  const after = m.mutate(before);
  if (before === after) {
    log('info', `${m.file} — sin cambios necesarios`);
    return;
  }
  if (DRY) {
    log('info', `[dry] ${m.file} — cambiaría`);
    return;
  }
  writeFileSync(path, after);
  log('ok', `${m.file} — limpio`);
}

function removeDir(rel: string): void {
  const path = resolve(ROOT, rel);
  if (!existsSync(path)) {
    log('info', `${rel}/ — no existe, saltado`);
    return;
  }
  if (DRY) {
    log('info', `[dry] ${rel}/ — eliminaría`);
    return;
  }
  rmSync(path, { recursive: true, force: true });
  log('ok', `${rel}/ eliminado`);
}

function removeFile(rel: string): void {
  const path = resolve(ROOT, rel);
  if (!existsSync(path)) return;
  if (DRY) {
    log('info', `[dry] ${rel} — eliminaría`);
    return;
  }
  unlinkSync(path);
  log('ok', `${rel} eliminado`);
}

function replaceWithRedirectHome(): void {
  const path = resolve(ROOT, 'src/pages/home/public-home.tsx');
  if (!existsSync(path)) {
    log('warn', 'src/pages/home/public-home.tsx — no existe, saltado');
    return;
  }
  if (DRY) {
    log('info', '[dry] src/pages/home/public-home.tsx — reemplazaría con redirect');
    return;
  }
  const content = `import { Navigate } from 'react-router';
import { useSession } from '@/lib/auth';
import { APP_ROUTES, AUTH_ROUTES } from '@/lib/constants';

/**
 * Raíz del sitio ("/").
 * Si hay sesión → al home autenticado. Si no → al login.
 *
 * ¿Quieres una landing pública? Reemplaza este archivo con tu diseño.
 */
export function PublicHome() {
  const { isAuthenticated, initialized } = useSession();
  if (!initialized) return null;
  return (
    <Navigate to={isAuthenticated ? APP_ROUTES.appHome : AUTH_ROUTES.login} replace />
  );
}
`;
  writeFileSync(path, content);
  log('ok', 'src/pages/home/public-home.tsx — reemplazado por redirect al login');
}

function removePackageJsonScripts(keys: string[]): void {
  const pkgPath = resolve(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
    scripts?: Record<string, string>;
  };
  let changed = false;
  for (const key of keys) {
    if (pkg.scripts && key in pkg.scripts) {
      delete pkg.scripts[key];
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    log('ok', `scripts removidos de package.json: ${keys.join(', ')}`);
  }
}

function uninstallDeps(): void {
  const pkgPath = resolve(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const toRemove = DEPS_TO_REMOVE.filter((d) => pkg.dependencies?.[d] || pkg.devDependencies?.[d]);

  if (toRemove.length === 0) {
    log('info', 'Deps de docs ya estaban desinstaladas');
    return;
  }

  log('info', `desinstalando ${toRemove.join(', ')}…`);
  const result = spawnSync('pnpm', ['remove', ...toRemove], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (result.status !== 0) {
    log('err', 'pnpm remove falló');
    return;
  }
  log('ok', 'deps desinstaladas');
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  log('err', msg);
  process.exit(1);
});
