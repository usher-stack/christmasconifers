<?php

declare(strict_types=1);
require_once __DIR__ . '/config.php';
start_secure_session();
header('Content-Type: image/svg+xml');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$question = (string) ($_SESSION['admin_captcha_question'] ?? '');
if (!preg_match('/^([1-9]) \+ ([1-9])$/', $question, $parts)) {
    $a = random_int(1, 9);
    $b = random_int(1, 9);
    $_SESSION['admin_captcha_answer'] = (string) ($a + $b);
    $_SESSION['admin_captcha_question'] = "{$a} + {$b}";
    $_SESSION['admin_captcha_created'] = time();
} else {
    $a = (int) $parts[1];
    $b = (int) $parts[2];
}
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="58" viewBox="0 0 220 58">
  <rect width="220" height="58" rx="7" fill="#f1f4ee"/>
  <text x="110" y="39" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#284638"><?= $a ?> + <?= $b ?> = ?</text>
</svg>
