#!/usr/bin/env node
/**
 * Genera backend/config.php usando variables de entorno del runner.
 * Lo llama el Action de GitHub antes de subir backend/ al cPanel.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const req = (name) => {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ Falta variable ${name}`);
    process.exit(1);
  }
  return v;
};

const appUrl = process.env.APP_URL ?? 'https://ilabtdi.com';
const origins = [appUrl, 'http://localhost:5172', 'http://localhost:5173'];

const cfg = `<?php
// Generado por scripts/generate-backend-config.mjs — no editar.
return [
  'db' => [
    'host'     => ${JSON.stringify(req('DB_HOST'))},
    'port'     => 3306,
    'database' => ${JSON.stringify(req('DB_NAME'))},
    'user'     => ${JSON.stringify(req('DB_USER'))},
    'password' => ${JSON.stringify(req('DB_PASS'))},
    'charset'  => 'utf8mb4',
  ],
  'jwt' => [
    'secret'      => ${JSON.stringify(req('JWT_SECRET'))},
    'issuer'      => 'ilabtdi',
    'access_ttl'  => 3600,
    'refresh_ttl' => 60 * 60 * 24 * 30,
  ],
  'cors' => [
    'allowed_origins' => ${JSON.stringify(origins)},
  ],
  'security' => [
    'login_max_attempts'  => 5,
    'login_window_secs'   => 60 * 15,
    'bcrypt_cost'         => 12,
    'password_min_length' => 10,
  ],
  'debug' => false,
];
`;

writeFileSync(resolve('backend/config.php'), cfg);
console.log('✓ backend/config.php generado');
