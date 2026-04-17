<?php
declare(strict_types=1);

final class Validation {
  public static function email(mixed $value): ?string {
    if (!is_string($value)) return null;
    $email = strtolower(trim($value));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return null;
    if (strlen($email) > 255) return null;
    return $email;
  }

  public static function password(mixed $value, int $minLength): ?string {
    if (!is_string($value)) return null;
    if (strlen($value) < $minLength || strlen($value) > 128) return null;
    if (!preg_match('/[a-z]/', $value)) return null;
    if (!preg_match('/[A-Z]/', $value)) return null;
    if (!preg_match('/\d/', $value)) return null;
    if (!preg_match('/[^A-Za-z0-9]/', $value)) return null;
    return $value;
  }

  public static function fullName(mixed $value): ?string {
    if (!is_string($value)) return null;
    $name = trim($value);
    if ($name === '' || strlen($name) > 100) return null;
    return $name;
  }
}
