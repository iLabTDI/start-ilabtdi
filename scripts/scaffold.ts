#!/usr/bin/env tsx
/**
 * scaffold.ts — limpia el template para iniciar un proyecto nuevo.
 *
 *   pnpm scaffold               # interactivo
 *   pnpm scaffold --force       # sin confirmación
 *   pnpm scaffold --dry-run     # muestra qué haría sin tocar nada
 *   pnpm scaffold --keep-md     # conserva la carpeta docs/ del repo
 *
 * Qué hace:
 *   1. Elimina la sección de documentación dentro de la app:
 *        - src/features/docs/
 *        - src/pages/docs-page.tsx
 *        - rutas /docs en src/app/router.tsx
 *        - referencias en nav/footer/home
 *   2. Desinstala deps que ya no se usan: react-markdown, remark-gfm, rehype-slug.
 *   3. Borra docs/ en el repo (a menos que pases --keep-md).
 *   4. Se auto-elimina — el script no queda en el proyecto final.
 *
 * Idempotente: correrlo dos veces no rompe nada (los cambios ya aplicados se saltan).
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
const KEEP_MD = args.has('--keep-md');

const DOC_DIRS = ['src/features/docs'];
const DOC_FILES = ['src/pages/docs-page.tsx'];
const DOCS_ROOT = 'docs';
const DEPS_TO_REMOVE = ['react-markdown', 'remark-gfm', 'rehype-slug'];

interface Mutation {
  file: string;
  description: string;
  mutate: (content: string) => string;
}

const MUTATIONS: Mutation[] = [
  {
    file: 'src/app/router.tsx',
    description: 'quitar rutas /docs del router',
    mutate: (c) =>
      c
        .replace(
          /import\s+\{\s*DocsPage,\s*DocsIndexRedirect\s*\}\s+from\s+'@\/pages\/docs-page';\s*\n/,
          ''
        )
        .replace(
          /\s*\/\/ Documentación[\s\S]*?\{ path: 'docs\/:slug', element: <DocsPage \/> \},\s*/,
          '\n'
        ),
  },
  {
    file: 'src/config/nav.ts',
    description: 'quitar item "Documentación" del sidebar',
    mutate: (c) =>
      c
        .replace(/,?\s*BookOpen/g, '')
        .replace(
          /\s*\{\s*label:\s*'Documentación',\s*href:\s*APP_ROUTES\.docs,\s*icon:\s*BookOpen\s*\},\s*/,
          '\n      '
        )
        .replace(/\s*docs:\s*'Documentación',\s*/g, '\n  '),
  },
  {
    file: 'src/lib/constants.ts',
    description: 'quitar APP_ROUTES.docs',
    mutate: (c) => c.replace(/\s*docs:\s*'\/docs',\s*/g, '\n  '),
  },
  {
    file: 'src/components/layout/public-nav.tsx',
    description: 'quitar link "Documentación" del nav público',
    mutate: (c) =>
      c.replace(
        /\s*\{\s*label:\s*'Documentación',\s*to:\s*'\/docs'\s*\},?\s*/,
        '\n'
      ),
  },
  {
    file: 'src/components/layout/public-footer.tsx',
    description: 'quitar columna "Recursos" del footer',
    mutate: (c) => {
      // Elimina el bloque completo <div>…Recursos…</ul></div>
      const regex = /\s*<div>\s*<p[^>]*>\s*Recursos[\s\S]*?<\/ul>\s*<\/div>\s*/;
      return c.replace(regex, '\n        ');
    },
  },
  {
    file: 'src/pages/app-home-page.tsx',
    description: 'quitar shortcut "Documentación" del home interno',
    mutate: (c) =>
      c
        .replace(
          /\s*\{\s*icon:\s*FiBookOpen,\s*title:\s*'Documentación',[\s\S]*?to:\s*APP_ROUTES\.docs,?\s*\},?\s*/,
          '\n  '
        )
        .replace(/,?\s*FiBookOpen\s*,?/, '')
        // eliminar la mención en el párrafo de bienvenida si quedó link a /docs
        .replace(
          /pasa por la\s*<Link[^>]*to=\{APP_ROUTES\.docs\}[^>]*>[^<]*<\/Link>[\s\S]*?—\s*te\s+ahorrará[\s\S]*?\./,
          'revisa la estructura del proyecto — te ahorrará tiempo en decisiones que ya están tomadas.'
        ),
  },
  {
    file: 'src/pages/home-page.tsx',
    description: 'quitar botón "Ver decisiones técnicas" de la landing',
    mutate: (c) =>
      c.replace(
        /\s*<div className="mt-6">\s*<Button asChild variant="outline">[\s\S]*?Ver decisiones técnicas[\s\S]*?<\/Button>\s*<\/div>/,
        ''
      ),
  },
];

async function main(): Promise<void> {
  log('info', `scaffold · iLab TDI${DRY ? ' [dry-run]' : ''}`);

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

  // 1. Mutar archivos
  for (const m of MUTATIONS) {
    applyMutation(m);
  }

  // 2. Borrar directorios
  for (const dir of DOC_DIRS) {
    removeDir(dir);
  }

  // 3. Borrar archivos
  for (const file of DOC_FILES) {
    removeFile(file);
  }

  // 4. Borrar carpeta docs/ (a menos que --keep-md)
  if (!KEEP_MD) {
    removeDir(DOCS_ROOT);
  } else {
    log('info', `docs/ conservado (--keep-md)`);
  }

  // 5. Desinstalar deps
  if (!DRY) {
    uninstallDeps();
    removeScaffoldScriptFromPackageJson();
  }

  // 6. Auto-eliminar
  if (!DRY) {
    const self = resolve(ROOT, 'scripts/scaffold.ts');
    try {
      unlinkSync(self);
      log('ok', 'scripts/scaffold.ts (self) removido');
    } catch {
      /* noop */
    }
  }

  log('ok', 'Scaffold completado.');
  log(
    'info',
    'Siguiente paso:\n    git init && git add . && git commit -m "chore: init from template"\n    pnpm dev'
  );
}

function printPlan(): void {
  console.log('\nVoy a:');
  console.log('  • eliminar dirs:    ' + DOC_DIRS.join(', '));
  console.log('  • eliminar files:   ' + DOC_FILES.join(', '));
  console.log(`  • eliminar docs/:   ${KEEP_MD ? 'NO (--keep-md)' : 'sí'}`);
  console.log('  • limpiar archivos:');
  for (const m of MUTATIONS) console.log(`      - ${m.file}  (${m.description})`);
  console.log('  • desinstalar deps: ' + DEPS_TO_REMOVE.join(', '));
  console.log('  • self-destruct:    scripts/scaffold.ts');
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
  if (!existsSync(path)) {
    log('info', `${rel} — no existe, saltado`);
    return;
  }
  if (DRY) {
    log('info', `[dry] ${rel} — eliminaría`);
    return;
  }
  unlinkSync(path);
  log('ok', `${rel} eliminado`);
}

function uninstallDeps(): void {
  const pkgPath = resolve(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const toRemove = DEPS_TO_REMOVE.filter(
    (d) => pkg.dependencies?.[d] || pkg.devDependencies?.[d]
  );

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
  log('ok', `deps desinstaladas`);
}

function removeScaffoldScriptFromPackageJson(): void {
  const pkgPath = resolve(ROOT, 'package.json');
  const raw = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
  if (pkg.scripts && 'scaffold' in pkg.scripts) {
    delete pkg.scripts.scaffold;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    log('ok', 'script "scaffold" removido de package.json');
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  log('err', msg);
  process.exit(1);
});
