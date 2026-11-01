<?php

declare(strict_types=1);
require_once __DIR__ . '/config.php';
start_secure_session();
require_json();
require_admin();

try {
    $pdo = database();

    $ordersToday = (int) $pdo->query(
        "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()"
    )->fetchColumn();

    $lowStockTrees = (int) $pdo->query(
        "SELECT COUNT(*) FROM products WHERE active = 1 AND stock_quantity <= low_stock_threshold AND category LIKE '%tree%'"
    )->fetchColumn();

    $ordersTotal = (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    $customersTotal = (int) $pdo->query('SELECT COUNT(*) FROM customers')->fetchColumn();

    $recentCustomers = $pdo->query(
        "SELECT name, email, status, created_at FROM customers ORDER BY created_at DESC LIMIT 8"
    )->fetchAll();

    $lowStockItems = $pdo->query(
        "SELECT id, name, sku, stock_quantity, low_stock_threshold FROM products
         WHERE active = 1 AND stock_quantity <= low_stock_threshold AND category LIKE '%tree%'
         ORDER BY stock_quantity ASC, name ASC LIMIT 8"
    )->fetchAll();

    $chart = $pdo->query(
        "SELECT DATE(created_at) AS order_date, COUNT(*) AS total
         FROM orders
         WHERE created_at >= CURDATE() - INTERVAL 13 DAY
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at) ASC"
    )->fetchAll();

    $chartByDate = [];
    foreach ($chart as $row) {
        $chartByDate[$row['order_date']] = (int) $row['total'];
    }

    $chartLabels = [];
    $chartValues = [];
    for ($offset = 13; $offset >= 0; $offset--) {
        $date = (new DateTimeImmutable("-{$offset} days"))->format('Y-m-d');
        $chartLabels[] = (new DateTimeImmutable($date))->format('M j');
        $chartValues[] = $chartByDate[$date] ?? 0;
    }

    echo json_encode([
        'updated_at' => gmdate('c'),
        'orders_today' => $ordersToday,
        'low_stock_trees' => $lowStockTrees,
        'orders_total' => $ordersTotal,
        'customers_total' => $customersTotal,
        'recent_customers' => $recentCustomers,
        'low_stock_items' => $lowStockItems,
        'chart' => ['labels' => $chartLabels, 'values' => $chartValues],
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['error' => 'MySQL dashboard data could not be loaded.', 'detail' => $error->getMessage()]);
}
