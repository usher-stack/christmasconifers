<?php

declare(strict_types=1);

function env_value(string $name, string $default = ''): string {
    $value = getenv($name);
    return $value === false || $value === '' ? $default : $value;
}

function database(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env_value('DB_HOST', '127.0.0.1');
    $port = env_value('DB_PORT', '3306');
    $database = env_value('DB_NAME', 'carols_christmas_conifers');
    $username = env_value('DB_USER', 'root');
    $password = env_value('DB_PASSWORD', '');

    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    return $pdo;
}

function require_json(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
}

function require_admin(): void {
    if (
        !isset($_SESSION['admin_authenticated'], $_SESSION['admin_role'], $_SESSION['admin_id']) ||
        $_SESSION['admin_authenticated'] !== true ||
        !in_array($_SESSION['admin_role'], ['admin', 'super_admin'], true)
    ) {
        http_response_code(401);
        echo json_encode(['error' => 'Administrator authentication required.']);
        exit;
    }

    try {
        $statement = database()->prepare("SELECT role, status FROM admin_users WHERE id = ? LIMIT 1");
        $statement->execute([(int) $_SESSION['admin_id']]);
        $account = $statement->fetch();
        if (!$account || $account['status'] !== 'active' || !in_array($account['role'], ['admin', 'super_admin'], true)) {
            throw new RuntimeException('Administrator account is no longer active.');
        }
        $_SESSION['admin_role'] = (string) $account['role'];
    } catch (Throwable $error) {
        $_SESSION = [];
        session_regenerate_id(true);
        http_response_code(401);
        echo json_encode(['error' => 'Administrator authentication is no longer valid.']);
        exit;
    }
}

function client_ip(): string {
    $value = isset($_SERVER['REMOTE_ADDR']) ? trim((string) $_SERVER['REMOTE_ADDR']) : '0.0.0.0';
    return filter_var($value, FILTER_VALIDATE_IP) ? $value : '0.0.0.0';
}

function ip_binary(string $ip): string {
    return inet_pton($ip) ?: inet_pton('0.0.0.0');
}

function base32_decode(string $input): string {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $input = strtoupper(preg_replace('/[^A-Z2-7]/', '', $input));
    $buffer = 0;
    $bits = 0;
    $output = '';
    for ($i = 0; $i < strlen($input); $i++) {
        $buffer = ($buffer << 5) | strpos($alphabet, $input[$i]);
        $bits += 5;
        if ($bits >= 8) {
            $bits -= 8;
            $output .= chr(($buffer >> $bits) & 0xff);
        }
    }
    return $output;
}

function verify_totp(string $secret, string $code, int $window = 1): bool {
    if (!preg_match('/^\d{6}$/', $code)) return false;
    $key = base32_decode($secret);
    if ($key === '') return false;
    $counter = intdiv(time(), 30);
    for ($offset = -$window; $offset <= $window; $offset++) {
        $packed = pack('N*', 0, $counter + $offset);
        $hash = hash_hmac('sha1', $packed, $key, true);
        $offsetByte = ord(substr($hash, -1)) & 0xf;
        $binary = unpack('N', substr($hash, $offsetByte, 4))[1] & 0x7fffffff;
        $expected = str_pad((string) ($binary % 1000000), 6, '0', STR_PAD_LEFT);
        if (hash_equals($expected, $code)) return true;
    }
    return false;
}

function start_secure_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https',
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }
}
