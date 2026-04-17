-- ─────────────────────────────────────────────────────────────
-- 002_email_tokens.sql
-- Tokens para confirmar email y restablecer contraseña.
-- Idempotente: puede correrse varias veces sin romper nada.
-- ─────────────────────────────────────────────────────────────

SET NAMES utf8mb4;

-- Añadir columna de verificación a users si aún no existe.
-- (MySQL 5.7+ y MariaDB 10.3+ soportan este patrón vía stored procedure.)

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name   = 'users'
    AND column_name  = 'email_verified_at'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `email_verified_at` DATETIME NULL DEFAULT NULL AFTER `avatar_url`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Tabla de tokens.
--   kind = 'verify'  → confirmación de email
--   kind = 'reset'   → recuperación de contraseña
--
-- Guardamos solo el hash del token. El plaintext se manda por correo
-- y nunca se persiste en la DB (previene que un dump de DB exponga tokens).

CREATE TABLE IF NOT EXISTS `email_tokens` (
  `token_hash`  VARCHAR(64)                     NOT NULL,
  `user_id`     CHAR(36)                        NOT NULL,
  `kind`        ENUM('verify','reset')          NOT NULL,
  `expires_at`  DATETIME                        NOT NULL,
  `used_at`     DATETIME                        NULL DEFAULT NULL,
  `created_at`  DATETIME                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_hash`),
  KEY `et_user_id_idx`    (`user_id`),
  KEY `et_expires_at_idx` (`expires_at`),
  KEY `et_user_kind_idx`  (`user_id`, `kind`),
  CONSTRAINT `et_user_fk` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
