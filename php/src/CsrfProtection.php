<?php
declare(strict_types=1);

namespace App;

class CsrfProtection
{
    public static function validate(): bool
    {
        $header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';
        if (!$header || !$sessionToken || !hash_equals($sessionToken, $header)) {
            return false;
        }
        return true;
    }

    public static function generate(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }
}
