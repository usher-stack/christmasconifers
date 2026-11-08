<?php
header('Content-Type: application/json');

$query = trim((string)($_GET['q'] ?? $_GET['query'] ?? ''));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 30)));
$indexFile = __DIR__ . '/product-index.json';
if (is_file($indexFile)) {
    $allProducts = json_decode((string)file_get_contents($indexFile), true);
    if (is_array($allProducts)) {
        $results = array_values(array_filter($allProducts, static function ($product) use ($query) {
            return $query === '' || stripos($product['title'], $query) !== false;
        }));
        usort($results, static fn($a, $b) => strcasecmp($a['title'], $b['title']));
        echo json_encode(array_slice($results, 0, $limit), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$productsDirectory = __DIR__ . '/products';
$results = [];

foreach (glob($productsDirectory . '/*.html') ?: [] as $file) {
    if ($query !== '') {
        $slug = strtolower(preg_replace('/[^a-z0-9]+/', ' ', basename($file, '.html')));
        $terms = preg_split('/\s+/', strtolower(preg_replace('/[^a-z0-9]+/', ' ', $query))) ?: [];
        $possible = true;
        foreach (array_filter($terms) as $term) {
            if (strlen($term) >= 2 && stripos($slug, $term) === false) {
                $possible = false;
                break;
            }
        }
        if (!$possible) {
            continue;
        }
    }

    $html = @file_get_contents($file);
    if ($html === false) {
        continue;
    }

    if (!preg_match('/property=["\']og:title["\'][\s\S]*?content=["\']([^"\']+)["\']/i', $html, $titleMatch)) {
        continue;
    }

    $title = html_entity_decode(trim($titleMatch[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if ($query !== '' && stripos($title, $query) === false) {
        continue;
    }

    preg_match('/property=["\']og:price:amount["\'][\s\S]*?content=["\']([^"\']+)["\']/i', $html, $priceMatch);
    preg_match('/property=["\']og:image["\'][\s\S]*?content=["\']([^"\']+)["\']/i', $html, $imageMatch);

    $image = trim($imageMatch[1] ?? '');
    $image = ltrim(html_entity_decode($image, ENT_QUOTES | ENT_HTML5, 'UTF-8'), './');
    $image = preg_replace('/^[\\\\\/]+/', '', $image);

    $results[] = [
        'title' => $title,
        'price' => $priceMatch[1] ?? '',
        'image' => $image !== '' ? $image : 'cdn/shop/files/carols-christmas-conifers-logo.svg',
        'url' => 'products/' . rawurlencode(basename($file)),
    ];
}

usort($results, static fn($a, $b) => strcasecmp($a['title'], $b['title']));
echo json_encode(array_slice($results, 0, $limit), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
