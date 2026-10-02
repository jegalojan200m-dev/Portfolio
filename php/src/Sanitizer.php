<?php
declare(strict_types=1);

namespace App;

class Sanitizer
{
    public static function string(?string $value, int $maxLength = 1000): string
    {
        $value = (string)($value ?? '');
        $value = trim($value);
        $value = strip_tags($value);
        $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if ($maxLength > 0) {
            $value = mb_substr($value, 0, $maxLength);
        }
        return $value;
    }

    public static function email(?string $value): string
    {
        $value = (string)($value ?? '');
        $value = trim($value);
        $value = strip_tags($value);
        $value = filter_var($value, FILTER_SANITIZE_EMAIL);
        return $value;
    }

    public static function phone(?string $value): string
    {
        $value = (string)($value ?? '');
        $value = trim($value);
        $value = preg_replace('/[^0-9+()-\s]/', '', $value) ?: '';
        return $value;
    }

    public static function url(?string $value): string
    {
        $value = (string)($value ?? '');
        $value = trim($value);
        $value = filter_var($value, FILTER_SANITIZE_URL);
        return $value;
    }

    public static function int($value, int $min = PHP_INT_MIN, int $max = PHP_INT_MAX): int
    {
        $value = filter_var($value, FILTER_SANITIZE_NUMBER_INT);
        $value = (int)$value;
        return max($min, min($max, $value));
    }
}
