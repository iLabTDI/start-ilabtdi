#!/usr/bin/env tsx
/**
 * db-setup.ts — aplica las migraciones MySQL al hosting remoto.
 *
 *   pnpm db:setup
 *   pnpm db:setup --ssh-tunnel    # fuerza tunnel SSH primero
 *
 * Lee .credentials.txt y ejecuta los archivos .sql de backend/sql/
 * en orden alfabético.
 *
 * Si DB_HOST es "localhost" y tienes SSH_HOST configurado, abre un
 * tunnel (127.0.0.1:3306 → SSH → localhost:3306 en el server).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import mysql from 'mysql2/promise';
import { log, parseDotenvFile, required, optional, ROOT } from './_shared.js';

const args = new Set(process.argv.slice(2));
const FORCE_TUNNEL = args.has('--ssh-tunnel');

async function main(): Promise<void> {
  const creds = parseDotenvFile(resolve(ROOT, '.credentials.txt'));

  const sqlDir = resolve(ROOT, 'backend/sql');
  const files = readdirSync(sqlDir).filter((f) => f.endsWith('.sql')).sort();
  if (files.length === 0) {
    log('warn', `No hay archivos .sql en ${sqlDir}`);
    return;
  }

  const dbHost = required(creds, 'DB_HOST');
  const dbPort = parseInt(optional(creds, 'DB_PORT', '3306'), 10);
  const dbUser = required(creds, 'DB_USER');
  const dbPass = required(creds, 'DB_PASS');
  const dbName = required(creds, 'DB_NAME');

  const useTunnel =
    FORCE_TUNNEL || (dbHost === 'localhost' && !!optional(creds, 'SSH_HOST'));

  let tunnel: ChildProcess | null = null;
  let connectHost = dbHost;
  let connectPort = dbPort;

  if (useTunnel) {
    const sshHost = required(creds, 'SSH_HOST');
    const sshUser = required(creds, 'SSH_USER');
    const sshPort = optional(creds, 'SSH_PORT', '22');
    const sshKey = optional(creds, 'SSH_KEY_PATH');
    const localPort = 33060; // puerto local para el tunnel

    log('info', `Abriendo SSH tunnel ${sshUser}@${sshHost}:${sshPort} → localhost:${dbPort}`);

    const sshArgs = [
      '-N',
      '-L', `${localPort}:localhost:${dbPort}`,
      '-p', sshPort,
      ...(sshKey ? ['-i', sshKey.replace('~', process.env.HOME ?? '')] : []),
      '-o', 'StrictHostKeyChecking=accept-new',
      `${sshUser}@${sshHost}`,
    ];
    tunnel = spawn('ssh', sshArgs, { stdio: 'pipe' });
    await waitForPort(localPort, 5000);
    connectHost = '127.0.0.1';
    connectPort = localPort;
    log('ok', `tunnel activo en 127.0.0.1:${localPort}`);
  }

  const conn = await mysql.createConnection({
    host: connectHost,
    port: connectPort,
    user: dbUser,
    password: dbPass,
    database: dbName,
    multipleStatements: true,
  });

  try {
    for (const file of files) {
      const sql = readFileSync(resolve(sqlDir, file), 'utf8');
      log('info', `aplicando ${file}`);
      await conn.query(sql);
      log('ok', `${file} aplicado`);
    }
  } finally {
    await conn.end();
    if (tunnel) {
      tunnel.kill();
      log('info', 'tunnel cerrado');
    }
  }

  log('ok', 'Migraciones aplicadas.');
}

async function waitForPort(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = spawnSync('nc', ['-z', '127.0.0.1', String(port)], { stdio: 'pipe' });
    if (r.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`SSH tunnel no llegó a abrirse en ${timeoutMs}ms`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  log('err', msg);
  process.exit(1);
});
