<?php
declare(strict_types=1);

namespace App;

class RateLimiter
{
    private string $storageDir;
    private int $window;
    private int $maxRequests;

    public function __construct(string $storageDir, int $window = 900, int $maxRequests = 5)
    {
        $this->storageDir = rtrim($storageDir, '/');
        $this->window = $window;
        $this->maxRequests = $maxRequests;
        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0755, true);
        }
    }

    public function isAllowed(string $key): bool
    {
        $file = $this->storageDir . '/' . md5($key) . '.json';
        $now = time();
        $requests = [];

        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true);
            $requests = is_array($data) ? $data : [];
            $requests = array_filter($requests, fn($t) => $t > ($now - $this->window));
        }

        if (count($requests) >= $this->maxRequests) {
            return false;
        }

        $requests[] = $now;
        file_put_contents($file, json_encode($requests, JSON_THROW_ON_ERROR), LOCK_EX);
        return true;
    }
}
