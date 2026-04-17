#!/usr/bin/env tsx
/**
 * db-user.ts — CRUD rápido de usuarios contra la tabla `users`.
 *
 *   pnpm db:user create   -e correo@x.com -p "Pass@123!" -n "Nombre"
 *   pnpm db:user list
 *   pnpm db:user reset    -e correo@x.com -p "NuevaPass@1!"
 *   pnpm db:user delete   -e correo@x.com
 *
 * Usa bcrypt local (bcryptjs) y se conecta con las creds de .credentials.txt.
 */

import { resolve } from 'node:path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { log, parseDotenvFile, required, optional, ROOT } from './_shared.js';

type Command = 'create' | 'list' | 'reset' | 'delete';

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || !isCommand(command)) {
    log('err', 'Uso: pnpm db:user <create|list|reset|delete> [flags]');
    process.exit(1);
  }

  const flags = parseFlags(rest);
  const creds = parseDotenvFile(resolve(ROOT, '.credentials.txt'));

  const conn = await mysql.createConnection({
    host: required(creds, 'DB_HOST'),
    port: parseInt(optional(creds, 'DB_PORT', '3306'), 10),
    user: required(creds, 'DB_USER'),
    password: required(creds, 'DB_PASS'),
    database: required(creds, 'DB_NAME'),
  });

  try {
    switch (command) {
      case 'create': await create(conn, flags); break;
      case 'list':   await list(conn); break;
      case 'reset':  await reset(conn, flags); break;
      case 'delete': await remove(conn, flags); break;
    }
  } finally {
    await conn.end();
  }
}

function isCommand(c: string): c is Command {
  return ['create', 'list', 'reset', 'delete'].includes(c);
}

function parseFlags(args: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a) continue;
    if (a === '-e' || a === '--email') out.email = args[++i] ?? '';
    else if (a === '-p' || a === '--password') out.password = args[++i] ?? '';
    else if (a === '-n' || a === '--name') out.name = args[++i] ?? '';
  }
  return out;
}

async function create(conn: mysql.Connection, flags: Record<string, string>): Promise<void> {
  const email = flags.email;
  const password = flags.password;
  const name = flags.name ?? 'Usuario';
  if (!email || !password) {
    log('err', 'create requiere -e <email> -p <password> [-n <nombre>]');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  const id = randomUUID();
  await conn.execute(
    `INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
    [id, email.toLowerCase(), hash, name]
  );
  log('ok', `Usuario creado: ${email} (id=${id})`);
}

async function list(conn: mysql.Connection): Promise<void> {
  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    `SELECT id, email, full_name, created_at, last_login_at
       FROM users ORDER BY created_at DESC LIMIT 50`
  );
  if (rows.length === 0) {
    log('warn', 'Sin usuarios registrados.');
    return;
  }
  // eslint-disable-next-line no-console
  console.table(rows);
}

async function reset(conn: mysql.Connection, flags: Record<string, string>): Promise<void> {
  const email = flags.email;
  const password = flags.password;
  if (!email || !password) {
    log('err', 'reset requiere -e <email> -p <nuevaPassword>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  const [result] = await conn.execute<mysql.ResultSetHeader>(
    `UPDATE users SET password_hash = ? WHERE email = ?`,
    [hash, email.toLowerCase()]
  );
  if (result.affectedRows === 0) {
    log('warn', `No se encontró usuario con email ${email}`);
    return;
  }
  log('ok', `Password actualizada para ${email}`);
}

async function remove(conn: mysql.Connection, flags: Record<string, string>): Promise<void> {
  const email = flags.email;
  if (!email) {
    log('err', 'delete requiere -e <email>');
    process.exit(1);
  }
  const [result] = await conn.execute<mysql.ResultSetHeader>(
    `DELETE FROM users WHERE email = ?`,
    [email.toLowerCase()]
  );
  log('ok', `Filas eliminadas: ${result.affectedRows}`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  log('err', msg);
  process.exit(1);
});
