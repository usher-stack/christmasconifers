<?php
$requested = basename((string)($_GET['file'] ?? ''));
$baseDirectory = __DIR__ . '/cdn/shop/files';
$exact = $baseDirectory . DIRECTORY_SEPARATOR . $requested;

if ($requested !== '' && is_file($exact)) {
    header('Content-Type: ' . mime_content_type($exact));
    readfile($exact);
    exit;
}

$extension = pathinfo($requested, PATHINFO_EXTENSION);
$stem = pathinfo($requested, PATHINFO_FILENAME);
$prefix = preg_replace('/[0-9a-f]{4,}$/i', '', $stem);
$prefix = rtrim($prefix, '_- ');

$matches = [];
foreach (glob($baseDirectory . DIRECTORY_SEPARATOR . '*.' . $extension) ?: [] as $file) {
    $name = pathinfo($file, PATHINFO_FILENAME);
    if (stripos($name, $stem) === 0 || ($prefix !== '' && stripos($name, $prefix) === 0)) {
        $matches[] = $file;
    }
}

if (!$matches) {
    header('Content-Type: image/svg+xml');
    echo '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300"><rect width="240" height="300" fill="#f5f5f1"/></svg>';
    exit;
}

$match = $matches[0];
header('Content-Type: ' . mime_content_type($match));
readfile($match);
