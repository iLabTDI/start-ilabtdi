#!/usr/bin/env tsx
/**
 * bootstrap.ts — wizard interactivo que configura un proyecto nuevo.
 *
 *   pnpm bootstrap
 *
 * Te guía con preguntas por el terminal. Puedes dejar campos vacíos y
 * llenarlos después manualmente. Al final genera:
 *
 *   .env                   para dev local
 *   .env.production.local  para builds de producción
 *   backend/config.php     si eliges PHP como backend
 *   (opcional) Secrets del repo en GitHub via `gh` CLI
 *
 * Flags:
 *   --non-interactive     no preguntes nada; lee .credentials.txt
 *   --force               sobrescribe archivos sin confirmar
 */

import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { input, password, select, confirm as confirmP } from '@inquirer/prompts';
import { log, randomSecret, ROOT } from './_shared.js';

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force') || args.has('-f');
const NON_INTERACTIVE = args.has('--non-interactive');

interface Answers {
  appName: string;
  appUrl: string;
  backend: 'supabase' | 'php' | 'demo';
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseProjectId: string;
  dbHost: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
  jwtSecret: string;
  ftpHost: string;
  ftpUser: string;
  ftpPass: string;
  ftpDir: string;
  ghPush: boolean;
  ghRepo: string;
}

async function main(): Promise<void> {
  printBanner();

  const defaults = tryLoadExistingCreds();
  const answers = NON_INTERACTIVE ? defaults : await askQuestions(defaults);

  printSummary(answers);

  if (!NON_INTERACTIVE) {
    const ok = await confirmP({
      message: '¿Proceder con estos valores?',
      default: true,
    });
    if (!ok) {
      log('warn', 'Cancelado. Nada se modificó.');
      return;
    }
  }

  writeFrontendEnv(answers);
  if (answers.backend === 'php') writeBackendConfig(answers);

  if (answers.ghPush) {
    uploadGithubSecrets(answers);
  }

  printDone(answers);
}

/* ───────────── Preguntas ───────────── */

async function askQuestions(d: Answers): Promise<Answers> {
  const answers: Answers = { ...d };

  // Cuando vienes de `pnpm create ilabtdi`, el nombre ya se preguntó en el binario.
  // Lo pasa vía env var y aquí nos saltamos la pregunta.
  const fromCreate = process.env.CREATE_ILABTDI_NAME;

  section('🎨 Branding del proyecto');

  if (fromCreate) {
    answers.appName = fromCreate;
    log('info', `Proyecto: ${fromCreate}`);
  } else {
    answers.appName = await input({
      message: '✨ Nombre del proyecto',
      default: d.appName || 'Mi Proyecto',
    });
  }

  answers.appUrl = await input({
    message: '🌐 URL pública (puedes ponerla después)',
    default: d.appUrl || 'http://localhost:5173',
  });

  section('🔐 Backend de autenticación');

  answers.backend = await select<Answers['backend']>({
    message: '¿Qué backend vas a usar?',
    default: d.backend || 'supabase',
    choices: [
      {
        name: '⚡  Supabase · recomendado (auth + DB + storage listo)',
        value: 'supabase',
        description: 'Plan free · setup en 2 min · la mejor DX',
      },
      {
        name: '🗄️  MySQL en GoDaddy · PHP backend propio',
        value: 'php',
        description: 'Todo vive en el hosting del lab',
      },
      {
        name: '🎭  Solo demo · no configurar nada aún',
        value: 'demo',
        description: 'Cuentas hardcodeadas · útil para presentaciones',
      },
    ],
  });

  /* ── Supabase ── */
  if (answers.backend === 'supabase') {
    const hasKeys = await confirmP({
      message: '🔑 ¿Ya tienes las keys de Supabase a la mano?',
      default: Boolean(d.supabaseUrl),
    });
    if (hasKeys) {
      answers.supabaseUrl = await input({
        message: '   ↳ VITE_SUPABASE_URL',
        default: d.supabaseUrl,
        validate: (v) => !v || v.startsWith('https://') || 'Debe empezar con https://',
      });
      answers.supabaseAnonKey = await password({
        message: '   ↳ VITE_SUPABASE_ANON_KEY (oculto)',
      });
      answers.supabaseProjectId = await input({
        message: '   ↳ Project ref (opcional · para generar tipos)',
        default: d.supabaseProjectId,
      });
    } else {
      log('info', 'OK · las pondrás después en .env');
    }
  }

  /* ── MySQL/PHP ── */
  if (answers.backend === 'php') {
    const hasDb = await confirmP({
      message: '🗃️  ¿Ya creaste la DB y user en cPanel?',
      default: Boolean(d.dbHost),
    });
    if (hasDb) {
      answers.dbHost = await input({
        message: '   ↳ DB_HOST',
        default: d.dbHost || 'localhost',
      });
      answers.dbName = await input({
        message: '   ↳ DB_NAME (con prefijo cPanel)',
        default: d.dbName,
      });
      answers.dbUser = await input({
        message: '   ↳ DB_USER',
        default: d.dbUser,
      });
      answers.dbPass = await password({ message: '   ↳ DB_PASS (oculto)' });
    } else {
      log('info', 'OK · puedes editar backend/config.php después');
    }

    answers.jwtSecret = d.jwtSecret || randomSecret(64);
    log('info', `🔒 JWT_SECRET generado (${answers.jwtSecret.length} chars)`);
  }

  /* ── FTP (deploy) ── */
  section('🚢 Deploy a GoDaddy');

  const wantFtp = await confirmP({
    message: '¿Configurar FTP para deploy automático?',
    default: Boolean(d.ftpHost),
  });
  if (wantFtp) {
    answers.ftpHost = await input({
      message: '   ↳ FTP_HOST',
      default: d.ftpHost,
    });
    answers.ftpUser = await input({
      message: '   ↳ FTP_USER',
      default: d.ftpUser,
    });
    answers.ftpPass = await password({ message: '   ↳ FTP_PASS (oculto)' });
    answers.ftpDir = await input({
      message: '   ↳ Ruta remota',
      default: d.ftpDir || '/public_html/',
    });
  }

  /* ── GitHub ── */
  section('🐙 GitHub');
  const ghInstalled = spawnSync('gh', ['--version'], { stdio: 'pipe' }).status === 0;
  if (ghInstalled) {
    answers.ghPush = await confirmP({
      message: '¿Subir secrets al repo de GitHub con `gh` CLI?',
      default: false,
    });
    if (answers.ghPush) {
      answers.ghRepo = await input({
        message: 'Repo (owner/nombre · deja vacío si ya estás en la carpeta del repo)',
        default: d.ghRepo,
        validate: (v) => !v || v.includes('/') || 'Formato: owner/repo',
      });
    }
  } else {
    log('info', '`gh` CLI no instalado · saltando subida automática a GitHub');
    answers.ghPush = false;
  }

  return answers;
}

/* ───────────── Banner ───────────── */

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
};

function printBanner(): void {
  const c = C.cyan;
  const r = C.reset;
  const g = C.gray;

  // ASCII "iLab TDI" compacto (ANSI Shadow style)
  const banner = `
${c}    ██╗${r} ██╗      █████╗ ██████╗  ${c}   ████████╗${r}██████╗ ██╗
${c}    ██║${r} ██║     ██╔══██╗██╔══██╗ ${c}   ╚══██╔══╝${r}██╔══██╗██║
${c}    ██║${r} ██║     ███████║██████╔╝ ${c}      ██║   ${r}██║  ██║██║
${c}    ██║${r} ██║     ██╔══██║██╔══██╗ ${c}      ██║   ${r}██║  ██║██║
${c}    ██║${r} ███████╗██║  ██║██████╔╝ ${c}      ██║   ${r}██████╔╝██║
${c}    ╚═╝${r} ╚══════╝╚═╝  ╚═╝╚═════╝  ${c}      ╚═╝   ${r}╚═════╝ ╚═╝${r}
`;

  console.log(banner);
  console.log(`${C.bold}   Starter Template · Bootstrap Wizard${r}`);
  console.log(`${g}   por ${r}Yair Hernández${g} · ${r}${c}github.com/yairhdz24${r}`);
  console.log(`${g}   ──────────────────────────────────────────────────${r}\n`);
}

function section(title: string): void {
  const g = C.gray;
  const c = C.cyan;
  const r = C.reset;
  const line = '─'.repeat(50);
  console.log(`\n${c}  ${title}${r}`);
  console.log(`${g}  ${line}${r}`);
}

function printSummary(a: Answers): void {
  const g = C.gray;
  const b = C.bold;
  const y = C.yellow;
  const c = C.cyan;
  const r = C.reset;

  console.log(`\n${c}╭${'─'.repeat(52)}╮${r}`);
  console.log(`${c}│${r}  ${b}📋 Resumen de tu configuración${r}${' '.repeat(19)}${c}│${r}`);
  console.log(`${c}╰${'─'.repeat(52)}╯${r}\n`);

  row('✨ Proyecto', a.appName || `${g}(sin nombre)${r}`);
  row('🌐 URL', a.appUrl || `${g}(pendiente)${r}`);

  const backendEmoji = a.backend === 'supabase' ? '⚡' : a.backend === 'php' ? '🗄️ ' : '🎭';
  row(`${backendEmoji} Backend`, `${y}${a.backend}${r}`);

  if (a.backend === 'supabase') {
    row('🔗 Supabase', a.supabaseUrl || `${g}(después)${r}`);
    row('🔑 Anon key', a.supabaseAnonKey ? `${g}●●●●●●●● guardada${r}` : `${g}(después)${r}`);
  }
  if (a.backend === 'php') {
    row('🗃️  DB host', a.dbHost || `${g}(pendiente)${r}`);
    row('📦 DB name', a.dbName || `${g}(pendiente)${r}`);
    row('🔒 JWT secret', `${g}●●●●●●●● (${a.jwtSecret.length} chars)${r}`);
  }

  if (a.ftpHost) {
    row('🚢 FTP', `${a.ftpHost} → ${a.ftpDir}`);
  } else {
    row('🚢 Deploy', `${g}(sin FTP)${r}`);
  }

  if (a.ghPush) {
    row('🐙 GitHub', a.ghRepo || `${g}(repo actual)${r}`);
  }
  console.log();
}

function row(key: string, value: string): void {
  console.log(`  ${C.gray}${key.padEnd(16)}${C.reset}  ${value}`);
}

function printDemoCredentials(): void {
  const g = C.gray;
  const r = C.reset;
  const b = C.bold;
  const y = C.yellow;

  console.log();
  console.log(`  ${y}╭${'─'.repeat(50)}╮${r}`);
  console.log(
    `  ${y}│${r}  ${b}🎭 Cuentas demo (modo sin backend real)${r}${' '.repeat(10)}${y}│${r}`
  );
  console.log(`  ${y}╰${'─'.repeat(50)}╯${r}\n`);
  console.log(`  Entra en ${C.cyan}/login${r} con cualquiera de estas:\n`);
  console.log(`    ${b}demo@ilabtdi.com${r}   ${g}·${r}  ${b}Demo2026!${r}`);
  console.log(`    ${b}admin@ilabtdi.com${r}  ${g}·${r}  ${b}Admin2026!${r}`);
  console.log(`\n  ${g}Edita la lista en src/features/auth/services/demo-auth-service.ts${r}`);
}

function printDone(a: Answers): void {
  const g = C.green;
  const r = C.reset;
  const gr = C.gray;
  const b = C.bold;
  const c = C.cyan;

  console.log();
  console.log(`  ${g}╭${'─'.repeat(50)}╮${r}`);
  console.log(
    `  ${g}│${r}  ${b}🎉 ¡Todo listo! Bootstrap completado.${r}${' '.repeat(12)}${g}│${r}`
  );
  console.log(`  ${g}╰${'─'.repeat(50)}╯${r}\n`);

  console.log(`  ${b}🚀 Siguientes pasos:${r}\n`);

  let step = 1;
  console.log(
    `  ${c}${step++}.${r}  ${b}pnpm dev${r}                ${gr}# arranca el dev server${r}`
  );

  if (a.backend === 'php' && (a.dbHost || a.dbName)) {
    console.log(
      `  ${c}${step++}.${r}  ${b}pnpm db:setup${r}           ${gr}# aplica migraciones MySQL${r}`
    );
  } else if (a.backend === 'supabase' && a.supabaseUrl) {
    console.log(
      `  ${c}${step++}.${r}  Abre Supabase SQL Editor     ${gr}# y corre supabase/_setup.sql${r}`
    );
  }

  if (!a.ghPush && a.ftpHost) {
    console.log(
      `  ${c}${step++}.${r}  Configura secrets en GitHub  ${gr}# ver docs del template${r}`
    );
  }

  console.log(
    `\n  ${gr}→ Edita src/config/brand.ts para poner tu marca (logo, colores, nombre).${r}`
  );

  // Si eligió demo, imprime las cuentas al final
  if (a.backend === 'demo') {
    printDemoCredentials();
  }

  console.log();
}

/* ───────────── Cargar defaults de .credentials.txt si existe ───────────── */

function tryLoadExistingCreds(): Answers {
  const empty: Answers = {
    appName: '',
    appUrl: '',
    backend: 'supabase',
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseProjectId: '',
    dbHost: '',
    dbName: '',
    dbUser: '',
    dbPass: '',
    jwtSecret: '',
    ftpHost: '',
    ftpUser: '',
    ftpPass: '',
    ftpDir: '/public_html/',
    ghPush: false,
    ghRepo: '',
  };

  const path = resolve(ROOT, '.credentials.txt');
  if (!existsSync(path)) return empty;

  const raw = readFileSync(path, 'utf8');
  const get = (k: string): string => {
    const m = raw.match(new RegExp(`^${k}=(.*)$`, 'm'));
    return m && m[1] ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };

  log('info', '.credentials.txt detectado · valores pre-cargados');

  const backend = (get('AUTH_BACKEND') || 'supabase') as Answers['backend'];

  return {
    ...empty,
    appName: get('APP_NAME'),
    appUrl: get('APP_URL'),
    backend,
    supabaseUrl: get('SUPABASE_URL'),
    supabaseAnonKey: get('SUPABASE_ANON_KEY'),
    supabaseProjectId: get('SUPABASE_PROJECT_ID'),
    dbHost: get('DB_HOST'),
    dbName: get('DB_NAME'),
    dbUser: get('DB_USER'),
    dbPass: get('DB_PASS'),
    jwtSecret: get('JWT_SECRET'),
    ftpHost: get('FTP_HOST'),
    ftpUser: get('FTP_USER'),
    ftpPass: get('FTP_PASS'),
    ftpDir: get('FTP_REMOTE_DIR') || '/public_html/',
    ghPush: (get('GH_AUTO_PUSH') || 'false').toLowerCase() === 'true',
    ghRepo: get('GH_REPO'),
  };
}

/* ───────────── Escritura de archivos ───────────── */

function writeFrontendEnv(a: Answers): void {
  const devLines = [
    `# Generado por pnpm bootstrap — no commitear`,
    `VITE_APP_NAME="${a.appName || 'iLab TDI'}"`,
    `VITE_APP_URL=http://localhost:5173`,
    `VITE_APP_VERSION=0.1.0`,
    `VITE_AUTH_BACKEND=${a.backend}`,
  ];
  const prodLines = [
    `# Generado por pnpm bootstrap — no commitear`,
    `VITE_APP_NAME="${a.appName || 'iLab TDI'}"`,
    `VITE_APP_URL=${a.appUrl || 'https://ilabtdi.com'}`,
    `VITE_APP_VERSION=0.1.0`,
    `VITE_AUTH_BACKEND=${a.backend}`,
  ];

  if (a.backend === 'supabase') {
    const url = a.supabaseUrl || 'https://placeholder.supabase.co';
    const key = a.supabaseAnonKey || 'placeholder-anon-key-xxxxxxxxxxxxxxxx';
    devLines.push(`VITE_SUPABASE_URL=${url}`);
    devLines.push(`VITE_SUPABASE_ANON_KEY=${key}`);
    prodLines.push(`VITE_SUPABASE_URL=${url}`);
    prodLines.push(`VITE_SUPABASE_ANON_KEY=${key}`);
    if (a.supabaseProjectId) {
      devLines.push(`SUPABASE_PROJECT_ID=${a.supabaseProjectId}`);
      prodLines.push(`SUPABASE_PROJECT_ID=${a.supabaseProjectId}`);
    }
  } else {
    const apiBase = (a.appUrl || 'http://localhost:5173').replace(/\/$/, '');
    devLines.push(`VITE_API_URL=${apiBase}/api`);
    prodLines.push(`VITE_API_URL=${apiBase}/api`);
    devLines.push(`VITE_SUPABASE_URL=https://placeholder.supabase.co`);
    devLines.push(`VITE_SUPABASE_ANON_KEY=placeholder-anon-key-xxxxxxxxxxxxxxxx`);
    prodLines.push(`VITE_SUPABASE_URL=https://placeholder.supabase.co`);
    prodLines.push(`VITE_SUPABASE_ANON_KEY=placeholder-anon-key-xxxxxxxxxxxxxxxx`);
  }

  writeFileSync(resolve(ROOT, '.env'), devLines.join('\n') + '\n');
  log('ok', 'escrito .env');
  writeFileSync(resolve(ROOT, '.env.production.local'), prodLines.join('\n') + '\n');
  log('ok', 'escrito .env.production.local');
}

function writeBackendConfig(a: Answers): void {
  const secret = a.jwtSecret || randomSecret(64);
  const php = `<?php
// Generado por pnpm bootstrap — no commitear.
return [
  'db' => [
    'host'     => ${JSON.stringify(a.dbHost || 'localhost')},
    'port'     => 3306,
    'database' => ${JSON.stringify(a.dbName)},
    'user'     => ${JSON.stringify(a.dbUser)},
    'password' => ${JSON.stringify(a.dbPass)},
    'charset'  => 'utf8mb4',
  ],
  'jwt' => [
    'secret'      => ${JSON.stringify(secret)},
    'issuer'      => 'ilabtdi',
    'access_ttl'  => 3600,
    'refresh_ttl' => 60 * 60 * 24 * 30,
  ],
  'cors' => [
    'allowed_origins' => ${JSON.stringify([
      a.appUrl || 'https://ilabtdi.com',
      'http://localhost:5172',
      'http://localhost:5173',
    ])},
  ],
  'security' => [
    'login_max_attempts'  => 5,
    'login_window_secs'   => 60 * 15,
    'bcrypt_cost'         => 12,
    'password_min_length' => 10,
  ],
  'mail' => [
    'driver'        => 'stub',
    'app_name'      => ${JSON.stringify(a.appName || 'iLab TDI')},
    'app_url'       => ${JSON.stringify(a.appUrl || 'https://ilabtdi.com')},
    'logo_url'      => ${JSON.stringify((a.appUrl || 'https://ilabtdi.com').replace(/\/$/, '') + '/logos/ilabtdi-logo.png')},
    'primary_color' => '#22d3ee',
    'from_email'    => 'no-reply@ilabtdi.com',
    'from_name'     => ${JSON.stringify(a.appName || 'iLab TDI')},
  ],
  'debug' => false,
];
`;
  writeFileSync(resolve(ROOT, 'backend/config.php'), php);
  log('ok', 'escrito backend/config.php');
}

/* ───────────── GitHub secrets ───────────── */

function uploadGithubSecrets(a: Answers): void {
  const authed = spawnSync('gh', ['auth', 'status'], { stdio: 'pipe' }).status === 0;
  if (!authed) {
    log('warn', '`gh` no autenticado · corre `gh auth login` y reintenta');
    return;
  }

  const repoArgs = a.ghRepo ? ['-R', a.ghRepo] : [];
  const secrets: Record<string, string> = {};

  if (a.ftpHost) {
    secrets.FTP_SERVER = a.ftpHost;
    secrets.FTP_USERNAME = a.ftpUser;
    secrets.FTP_PASSWORD = a.ftpPass;
    secrets.FTP_SERVER_DIR = a.ftpDir;
  }

  if (a.backend === 'supabase' && a.supabaseUrl && a.supabaseAnonKey) {
    secrets.VITE_SUPABASE_URL = a.supabaseUrl;
    secrets.VITE_SUPABASE_ANON_KEY = a.supabaseAnonKey;
  }
  if (a.backend === 'php' && a.dbHost) {
    secrets.DB_HOST = a.dbHost;
    secrets.DB_NAME = a.dbName;
    secrets.DB_USER = a.dbUser;
    secrets.DB_PASS = a.dbPass;
    secrets.JWT_SECRET = a.jwtSecret;
  }

  if (Object.keys(secrets).length === 0) {
    log('warn', 'nada que subir · no hay credenciales completas');
    return;
  }

  log(
    'info',
    `subiendo ${Object.keys(secrets).length} secrets${a.ghRepo ? ` a ${a.ghRepo}` : ''}…`
  );

  for (const [key, value] of Object.entries(secrets)) {
    const r = spawnSync('gh', ['secret', 'set', key, ...repoArgs, '-b', value], {
      stdio: 'pipe',
    });
    if (r.status === 0) log('ok', `secret ${key}`);
    else log('err', `secret ${key} · ${r.stderr.toString().trim()}`);
  }

  const vars = {
    VITE_APP_NAME: a.appName || 'iLab TDI',
    VITE_APP_URL: a.appUrl || 'https://ilabtdi.com',
    VITE_AUTH_BACKEND: a.backend === 'demo' ? 'supabase' : a.backend,
  };
  for (const [key, value] of Object.entries(vars)) {
    const r = spawnSync('gh', ['variable', 'set', key, ...repoArgs, '-b', value], {
      stdio: 'pipe',
    });
    if (r.status === 0) log('ok', `variable ${key}`);
  }
  // Para evitar warning de --force sin uso
  void FORCE;
}

main().catch((err: unknown) => {
  // Cancelación con Ctrl+C de inquirer
  if (
    err instanceof Error &&
    (err.name === 'ExitPromptError' || err.message.includes('force closed'))
  ) {
    console.log(`\n${C.yellow}Cancelado.${C.reset}`);
    process.exit(0);
  }
  const msg = err instanceof Error ? err.message : String(err);
  log('err', msg);
  process.exit(1);
});
