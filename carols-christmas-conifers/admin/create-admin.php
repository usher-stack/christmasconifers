<?php
// CLI-only provisioning utility. Run once from a shell, never through a public web server.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/config.php';
if ($argc < 5) {
    fwrite(STDERR, "Usage: php create-admin.php EMAIL PASSWORD TOTP_BASE32_SECRET [super_admin|admin]\n");
    exit(1);
}
$email = strtolower(trim((string) $argv[1]));
$password = (string) $argv[2];
$totpSecret = strtoupper(preg_replace('/[^A-Z2-7]/', '', (string) $argv[3]));
$role = $argv[4] === 'super_admin' ? 'super_admin' : 'admin';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 14 || strlen($totpSecret) < 16) {
    fwrite(STDERR, "Use a valid email, a password of at least 14 characters, and a Base32 TOTP secret.\n");
    exit(1);
}
try {
    $pdo = database();
    $statement = $pdo->prepare(
        "INSERT INTO admin_users (email, password_hash, totp_secret, role, status)
         VALUES (?, ?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), totp_secret=VALUES(totp_secret), role=VALUES(role), status='active'"
    );
    $statement->execute([$email, password_hash($password, PASSWORD_ARGON2ID), $totpSecret, $role]);
    fwrite(STDOUT, "Administrator created or updated.\n");
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . PHP_EOL);
    exit(1);
}
