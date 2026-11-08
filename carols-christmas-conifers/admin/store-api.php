<?php

declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_json();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}
$token = (string) ($_SERVER['HTTP_X_STORE_API_TOKEN'] ?? '');
$configuredToken = env_value('STORE_API_TOKEN', 'carols-local-store-api-2026');
if ($configuredToken === '' || strlen($token) !== strlen($configuredToken) || !hash_equals($configuredToken, $token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Store API authentication failed.']);
    exit;
}

if (($payload ?? null) === null) {
    $payload = json_decode((string) file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR);
}
$pdo = database();
if (($_POST['action'] ?? '') === 'customer_register' || (($payload['action'] ?? '') === 'customer_register')) {
    $email = strtolower(trim((string) ($payload['email'] ?? '')));
    $password = (string) ($payload['password'] ?? '');
    $passwordConfirmation = (string) ($payload['passwordConfirmation'] ?? '');
    $name = trim((string) ($payload['name'] ?? ''));
    $country = trim((string) ($payload['country'] ?? ''));
    $countryCode = trim((string) ($payload['countryCode'] ?? ''));
    $phone = trim((string) ($payload['phone'] ?? ''));
    $city = trim((string) ($payload['city'] ?? ''));
    $street = trim((string) ($payload['street'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 ||
        strlen($password) < 10 || strlen($password) > 200 || $password !== $passwordConfirmation ||
        $name === '' || $city === '' || $street === '' ||
        !preg_match('/^\+\d{1,4}$/', $countryCode)) {
        http_response_code(400);
        echo json_encode(['error' => 'Complete every account field and ensure both passwords match.']);
        exit;
    }
    try {
        $salt = bin2hex(random_bytes(16));
        $statement = $pdo->prepare('INSERT INTO customers (name,email,country,country_code,phone,password_hash,password_salt,city,street,status)
                                    VALUES (?,?,?,?,?,?,?,?,?,\'active\')');
        $statement->execute([$name, $email, $country, $countryCode, $phone, password_hash($password, PASSWORD_ARGON2ID), $salt, $city, $street]);
        $id = (int) $pdo->lastInsertId();
        echo json_encode(['ok' => true, 'account' => [
            'id' => $id, 'name' => $name, 'email' => $email, 'country' => $country,
            'countryCode' => $countryCode, 'phone' => $phone, 'city' => $city, 'street' => $street, 'status' => 'active'
        ]]);
    } catch (PDOException $error) {
        if ($error->getCode() === '23000') {
            http_response_code(409);
            echo json_encode(['error' => 'An account already exists for this email.']);
        } else {
            throw $error;
        }
    }
    exit;
}

if (($payload['action'] ?? '') === 'customer_login') {
    $email = strtolower(trim((string) ($payload['email'] ?? '')));
    $password = (string) ($payload['password'] ?? '');
    $statement = $pdo->prepare('SELECT * FROM customers WHERE email = ?');
    $statement->execute([$email]);
    $account = $statement->fetch();
    if (!$account || $account['status'] !== 'active' || !password_verify($password, (string) $account['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Email or password is incorrect.']);
        exit;
    }
    echo json_encode(['ok' => true, 'account' => [
        'id' => (int) $account['id'], 'name' => $account['name'], 'email' => $account['email'],
        'country' => $account['country'], 'countryCode' => $account['country_code'],
        'phone' => $account['phone'], 'city' => $account['city'], 'street' => $account['street'], 'status' => $account['status']
    ]]);
    exit;
}

try {
    $reference = trim((string) ($payload['reference'] ?? ''));
    $total = (float) ($payload['total'] ?? 0);
    $currency = strtoupper(trim((string) ($payload['currency'] ?? 'USD')));
    $items = $payload['items'] ?? [];
    if (!preg_match('/^[A-Z0-9-]{6,40}$/', $reference) || !preg_match('/^[A-Z]{3}$/', $currency) || !is_array($items) || count($items) === 0 || count($items) > 50 || $total < 0) {
        throw new InvalidArgumentException('Invalid order payload.');
    }

    $pdo = database();
    $pdo->beginTransaction();
    $order = $pdo->prepare("INSERT INTO orders (order_reference, status, total, currency, whatsapp_sent_at, created_at)
                            VALUES (?, 'pending', ?, ?, NOW(), NOW())
                            ON DUPLICATE KEY UPDATE total=VALUES(total), currency=VALUES(currency)");
    $order->execute([$reference, $total, $currency]);
    $id = (int) $pdo->lastInsertId();
    if ($id === 0) {
        $lookup = $pdo->prepare('SELECT id FROM orders WHERE order_reference = ?');
        $lookup->execute([$reference]);
        $id = (int) $lookup->fetchColumn();
    }
    $pdo->prepare('DELETE FROM order_items WHERE order_id = ?')->execute([$id]);
    foreach ($items as $item) {
        $name = trim((string) ($item['title'] ?? ''));
        $quantity = filter_var($item['quantity'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 99]]);
        $price = (float) ($item['price'] ?? -1);
        if ($name === '' || strlen($name) > 300 || $quantity === false || $price < 0) {
            throw new InvalidArgumentException('Invalid order item.');
        }
        $insertItem = $pdo->prepare('INSERT INTO order_items (order_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?)');
        $insertItem->execute([$id, $name, $quantity, $price]);
    }
    $pdo->commit();
    echo json_encode(['ok' => true, 'reference' => $reference]);
} catch (JsonException | InvalidArgumentException $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('Store API failed: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'The order could not be saved.']);
}
