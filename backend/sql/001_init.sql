-- ─────────────────────────────────────────────────────────────
-- MySQL · Schema inicial para auth propia
-- Equivalente al `profiles` de Supabase pero con password
-- self-managed (hash bcrypt almacenado en la misma tabla).
-- Compatible con MySQL 5.7+ y MariaDB 10.3+ (GoDaddy cPanel).
-- ─────────────────────────────────────────────────────────────

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id`              CHAR(36)       NOT NULL,
  `email`           VARCHAR(255)   NOT NULL,
  `password_hash`   VARCHAR(255)   NOT NULL,
  `full_name`       VARCHAR(100)   NULL,
  `avatar_url`      VARCHAR(2048)  NULL,
  `email_verified_at` DATETIME     NULL DEFAULT NULL,
  `last_login_at`   DATETIME       NULL DEFAULT NULL,
  `created_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_created_at_idx` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`          CHAR(36)      NOT NULL,
  `user_id`     CHAR(36)      NOT NULL,
  `token_hash`  VARCHAR(255)  NOT NULL,
  `expires_at`  DATETIME      NOT NULL,
  `revoked_at`  DATETIME      NULL DEFAULT NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rt_user_id_idx` (`user_id`),
  KEY `rt_expires_at_idx` (`expires_at`),
  CONSTRAINT `rt_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rate_limits` (
  `id`          BIGINT        NOT NULL AUTO_INCREMENT,
  `bucket`      VARCHAR(128)  NOT NULL,
  `attempts`    INT           NOT NULL DEFAULT 1,
  `first_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rl_bucket_unique` (`bucket`),
  KEY `rl_last_at_idx` (`last_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
