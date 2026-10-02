<?php
declare(strict_types=1);

namespace App;

class Logger
{
    public static function log(string $level, string $message, array $context = []): void
    {
        $logDir = __DIR__ . '/../../../messages/';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        $logFile = $logDir . 'app_logs.json';
        $entry = [
            'timestamp' => (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
        ];
        $logs = [];
        if (file_exists($logFile)) {
            $decoded = json_decode(file_get_contents($logFile), true);
            $logs = is_array($decoded) ? $decoded : [];
        }
        $logs[] = $entry;
        file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);
    }
}
