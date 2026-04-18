#!/usr/bin/env node
/**
 * create-ilabtdi — arrancador oficial de proyectos del iLab TDI.
 *
 *   pnpm create ilabtdi mi-proyecto
 *   npm  create ilabtdi@latest mi-proyecto
 *   yarn create ilabtdi mi-proyecto
 *
 * Zero dependencies — usa solo APIs nativas de Node 20+.
 */

import { existsSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit, cwd, chdir } from 'node:process';

/* ───── Config ───── */

const TEMPLATE_REPO = 'https://github.com/iLabTDI/start-ilabtdi.git';
const TEMPLATE_DEFAULT_BRANCH = 'main';

/* ───── Colores ANSI (zero deps) ───── */

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const c = (color, text) => `${C[color]}${text}${C.reset}`;

/* ───── Logger ───── */

const log = {
  info: (msg) => console.log(`${c('cyan', '→')} ${msg}`),
  ok: (msg) => console.log(`${c('green', '✓')} ${msg}`),
  warn: (msg) => console.log(`${c('yellow', '!')} ${msg}`),
  err: (msg) => console.log(`${c('red', '✗')} ${msg}`),
};

/* ───── Banner ───── */

function printBanner() {
  console.log(`
${c('cyan', '    ██╗')} ██╗      █████╗ ██████╗  ${c('cyan', '   ████████╗')}██████╗ ██╗
${c('cyan', '    ██║')} ██║     ██╔══██╗██╔══██╗ ${c('cyan', '   ╚══██╔══╝')}██╔══██╗██║
${c('cyan', '    ██║')} ██║     ███████║██████╔╝ ${c('cyan', '      ██║   ')}██║  ██║██║
${c('cyan', '    ██║')} ██║     ██╔══██║██╔══██╗ ${c('cyan', '      ██║   ')}██║  ██║██║
${c('cyan', '    ██║')} ███████╗██║  ██║██████╔╝ ${c('cyan', '      ██║   ')}██████╔╝██║
${c('cyan', '    ╚═╝')} ╚══════╝╚═╝  ╚═╝╚═════╝  ${c('cyan', '      ╚═╝   ')}╚═════╝ ╚═╝
`);
  console.log(`   ${c('bold', 'create-ilabtdi')} · template starter para el lab`);
  console.log(`   ${c('gray', 'por ')}Yair Hernández${c('gray', ' · ')}${c('cyan', 'github.com/yairhdz24')}`);
  console.log(`   ${c('gray', '──────────────────────────────────────────────────')}\n`);
}

/* ───── Flags ───── */

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('-')));
  const positional = args.filter((a) => !a.startsWith('-'));
  return {
    name: positional[0],
    force: flags.has('--force') || flags.has('-f'),
    skipInstall: flags.has('--skip-install'),
    skipBootstrap: flags.has('--skip-bootstrap'),
    help: flags.has('--help') || flags.has('-h'),
  };
}

function printHelp() {
  console.log(`
${c('bold', 'Uso:')}
  pnpm create ilabtdi ${c('gray', '[nombre]')}
  npm  create ilabtdi@latest ${c('gray', '[nombre]')}

${c('bold', 'Opciones:')}
  ${c('cyan', '--force')}           Sobrescribe la carpeta si ya existe
  ${c('cyan', '--skip-install')}    No ejecuta pnpm install
  ${c('cyan', '--skip-bootstrap')}  No ejecuta el wizard después
  ${c('cyan', '--help')}            Muestra esta ayuda

${c('bold', 'Ejemplo:')}
  ${c('gray', '$')} pnpm create ilabtdi mi-proyecto
`);
}

/* ───── Prompt helper (readline nativo) ───── */

async function prompt(question, defaultValue = '') {
  const rl = createInterface({ input: stdin, output: stdout });
  const suffix = defaultValue ? c('gray', ` (${defaultValue})`) : '';
  const answer = await rl.question(`${c('cyan', '?')} ${question}${suffix} `);
  rl.close();
  return answer.trim() || defaultValue;
}

async function confirm(question, defaultYes = true) {
  const yesNo = defaultYes ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} ${c('gray', `[${yesNo}]`)}`);
  if (!answer) return defaultYes;
  return /^y(es)?$/i.test(answer);
}

/* ───── Validación de nombre ───── */

function isValidName(name) {
  if (!name || name.trim() === '') return 'El nombre no puede estar vacío.';
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(name)) {
    return 'Usa solo letras, números, guiones (-) y underscores (_).';
  }
  if (name.length > 50) return 'Máximo 50 caracteres.';
  return true;
}

/* ───── Main ───── */

async function main() {
  const flags = parseArgs(argv);

  if (flags.help) {
    printHelp();
    return;
  }

  printBanner();

  /* 1. Obtener nombre del proyecto */
  let name = flags.name;
  while (true) {
    if (!name) {
      name = await prompt('Nombre del proyecto', 'mi-proyecto');
    }
    const check = isValidName(name);
    if (check === true) break;
    log.warn(check);
    name = '';
  }

  const targetDir = resolve(cwd(), name);

  /* 2. Verificar carpeta destino */
  if (existsSync(targetDir)) {
    if (!flags.force) {
      log.warn(`La carpeta "${name}" ya existe en ${targetDir}`);
      const overwrite = await confirm('¿Eliminarla y continuar?', false);
      if (!overwrite) {
        log.info('Cancelado.');
        exit(0);
      }
    }
    rmSync(targetDir, { recursive: true, force: true });
    log.info(`Carpeta "${name}" eliminada.`);
  }

  /* 3. Clonar template */
  log.info(`Clonando template en ${c('bold', name)}…`);
  const cloneResult = spawnSync(
    'git',
    ['clone', '--depth=1', '--branch', TEMPLATE_DEFAULT_BRANCH, TEMPLATE_REPO, targetDir],
    { stdio: 'pipe' }
  );

  if (cloneResult.status !== 0) {
    log.err('No fue posible clonar el template.');
    log.err(cloneResult.stderr?.toString().trim() || '(sin detalles)');
    log.info('Verifica tu conexión a internet y que `git` esté instalado.');
    exit(1);
  }

  // Borrar historia git del template
  rmSync(resolve(targetDir, '.git'), { recursive: true, force: true });
  log.ok(`Template clonado en ${c('cyan', targetDir)}`);

  /* 4. Ajustar package.json con el nombre del proyecto */
  try {
    const pkgPath = resolve(targetDir, 'package.json');
    const { readFileSync, writeFileSync } = await import('node:fs');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.name = name.toLowerCase();
    pkg.version = '0.1.0';
    delete pkg.description;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  } catch {
    log.warn('No fue posible ajustar package.json automáticamente.');
  }

  /* 5. pnpm install */
  if (!flags.skipInstall) {
    log.info('Instalando dependencias con pnpm… (puede tardar ~1 min)');
    chdir(targetDir);
    const installResult = spawnSync('pnpm', ['install'], { stdio: 'inherit' });
    if (installResult.status !== 0) {
      log.err('`pnpm install` falló.');
      log.info(`Corre manualmente: cd ${name} && pnpm install`);
      exit(1);
    }
    log.ok('Dependencias instaladas.');
  } else {
    log.info('--skip-install: saltando pnpm install.');
  }

  /* 6. Wizard bootstrap */
  if (!flags.skipBootstrap && !flags.skipInstall) {
    log.info('Abriendo el wizard de configuración…\n');
    const bootstrapResult = spawnSync('pnpm', ['bootstrap'], { stdio: 'inherit' });
    if (bootstrapResult.status !== 0) {
      log.warn('El wizard no terminó completo. Puedes correrlo después con `pnpm bootstrap`.');
    }
  }

  /* 7. Fin */
  console.log();
  console.log(`  ${c('green', '╭──────────────────────────────────────────────────╮')}`);
  console.log(`  ${c('green', '│')}  ${c('bold', '🎉 ¡Proyecto creado!')}${' '.repeat(29)}${c('green', '│')}`);
  console.log(`  ${c('green', '╰──────────────────────────────────────────────────╯')}\n`);

  console.log(`  ${c('gray', 'Tu proyecto está en:')}`);
  console.log(`  ${c('cyan', targetDir)}\n`);

  console.log(`  ${c('bold', '🚀 Siguientes pasos:')}\n`);
  console.log(`    ${c('cyan', 'cd')} ${name}`);
  if (flags.skipInstall) {
    console.log(`    ${c('cyan', 'pnpm install')}`);
    console.log(`    ${c('cyan', 'pnpm bootstrap')}`);
  }
  console.log(`    ${c('cyan', 'pnpm dev')}\n`);
}

main().catch((err) => {
  if (err?.code === 'ERR_USE_AFTER_CLOSE' || /closed/i.test(err?.message ?? '')) {
    console.log(`\n${c('yellow', 'Cancelado.')}`);
    exit(0);
  }
  log.err(err?.message ?? String(err));
  exit(1);
});
