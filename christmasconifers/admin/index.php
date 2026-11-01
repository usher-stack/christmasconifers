<?php

declare(strict_types=1);
require_once __DIR__ . '/config.php';
start_secure_session();
$error = '';
if (empty($_SESSION['admin_csrf'])) $_SESSION['admin_csrf'] = bin2hex(random_bytes(32));
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = (string) ($_POST['password'] ?? '');
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $totpCode = trim((string) ($_POST['totp'] ?? ''));
    $captcha = trim((string) ($_POST['captcha'] ?? ''));
    $csrf = (string) ($_POST['csrf'] ?? '');
    if (!hash_equals((string) $_SESSION['admin_csrf'], $csrf)) {
        $error = 'Your session expired. Refresh the page and try again.';
    } else {
        $ip = client_ip();
        try {
            $pdo = database();
            $recent = $pdo->prepare("SELECT COUNT(*) FROM admin_login_attempts WHERE ip_address = ? AND succeeded = 0 AND attempted_at >= NOW() - INTERVAL 15 MINUTE");
            $recent->execute([ip_binary($ip)]);
            if ((int) $recent->fetchColumn() >= 5) {
                $error = 'Too many failed sign-in attempts. Wait 15 minutes before trying again.';
            } elseif (empty($_SESSION['admin_captcha_answer']) || time() - (int) ($_SESSION['admin_captcha_created'] ?? 0) > 600 || !hash_equals((string) $_SESSION['admin_captcha_answer'], $captcha)) {
                $error = 'The security challenge is incorrect or expired.';
                $record = $pdo->prepare('INSERT INTO admin_login_attempts (ip_address, username, succeeded) VALUES (?, ?, 0)');
                $record->execute([ip_binary($ip), substr($email, 0, 254)]);
            } else {
                $account = $pdo->prepare("SELECT id, email, password_hash, totp_secret, role, status FROM admin_users WHERE email = ? LIMIT 1");
                $account->execute([$email]);
                $admin = $account->fetch();
                $validPassword = $admin && password_verify($password, (string) $admin['password_hash']);
                $validTotp = $admin && $admin['status'] === 'active' && in_array($admin['role'], ['admin', 'super_admin'], true) && verify_totp((string) $admin['totp_secret'], $totpCode);
                if (!$validPassword || !$validTotp) {
                    $record = $pdo->prepare('INSERT INTO admin_login_attempts (ip_address, username, succeeded) VALUES (?, ?, 0)');
                    $record->execute([ip_binary($ip), substr($email, 0, 254)]);
                    $error = 'The sign-in details are incorrect.';
                } else {
                    $record = $pdo->prepare('INSERT INTO admin_login_attempts (ip_address, username, succeeded) VALUES (?, ?, 1)');
                    $record->execute([ip_binary($ip), substr($email, 0, 254)]);
                    session_regenerate_id(true);
                    $_SESSION['admin_authenticated'] = true;
                    $_SESSION['admin_id'] = (int) $admin['id'];
                    $_SESSION['admin_role'] = (string) $admin['role'];
                    $_SESSION['admin_email'] = (string) $admin['email'];
                    $_SESSION['admin_csrf'] = bin2hex(random_bytes(32));
                    unset($_SESSION['admin_captcha_answer'], $_SESSION['admin_captcha_created']);
                    header('Location: index.php');
                    exit;
                }
            }
        } catch (Throwable $exception) {
            error_log('Administrator sign-in failed: ' . $exception->getMessage());
            $error = 'Administration sign-in is temporarily unavailable.';
        }
    }
}
$isAuthenticated = isset($_SESSION['admin_authenticated'], $_SESSION['admin_role']) && $_SESSION['admin_authenticated'] === true && in_array($_SESSION['admin_role'], ['admin', 'super_admin'], true);
?>
!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Carol's Christmas Conifers - Admin</title>
  <style>
    :root { color-scheme: light; --green:#284638; --green2:#466b57; --cream:#f5f5ef; --ink:#202820; --line:#dfe5dc; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; background:var(--cream); color:var(--ink); font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif; }
    button,input { font:inherit; }
    .login { display:grid; place-items:center; min-height:100vh; padding:24px; }
    .login-card,.panel { background:#fff; border:1px solid var(--line); border-radius:18px; box-shadow:0 16px 45px rgba(31,51,39,.09); }
    .login-card { width:min(440px,100%); padding:32px; }
    .login-card h1 { margin:0 0 6px; color:var(--green); }
    .login-card p { color:#687168; }
    .field { display:grid; gap:8px; margin:20px 0; font-weight:650; }
    .field input { min-height:48px; padding:10px 12px; border:1px solid #cbd3c8; border-radius:9px; }
    .button { border:0; border-radius:9px; padding:11px 18px; background:var(--green); color:#fff; cursor:pointer; font-weight:700; }
    .error { color:#a32121; font-weight:650; }
    .shell { max-width:1240px; margin:auto; padding:28px 20px 50px; }
    header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; }
    header h1 { margin:0; color:var(--green); }
    header a { color:var(--green); font-weight:700; }
    .live { display:inline-flex; align-items:center; gap:8px; color:#58705f; font-size:.88rem; }
    .live::before { content:""; width:9px; height:9px; border-radius:50%; background:#35a85b; box-shadow:0 0 0 5px #35a85b20; }
    .stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
    .stat { padding:22px; }
    .stat span { color:#697268; font-size:.88rem; }
    .stat strong { display:block; margin-top:4px; color:var(--green); font-size:2rem; line-height:1; }
    .grid { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(280px,.85fr); gap:16px; margin-top:16px; }
    .panel { min-width:0; padding:22px; }
    .panel h2 { margin:0 0 18px; color:var(--green); font-size:1.15rem; }
    canvas { width:100%; height:280px; }
    table { width:100%; border-collapse:collapse; }
    th,td { padding:11px 8px; border-bottom:1px solid #edf0eb; text-align:left; }
    th { color:#657067; font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; }
    td { font-size:.91rem; }
    .stock-low { color:#b4432f; font-weight:750; }
    .status { padding:3px 8px; border-radius:999px; background:#edf3ee; color:#426350; font-size:.78rem; }
    .status.suspended { background:#fff0ed; color:#a33d2d; }
    .empty { color:#747d74; }
    @media (max-width:900px) { .stats { grid-template-columns:repeat(2,minmax(0,1fr)); } .grid { grid-template-columns:1fr; } }
    @media (max-width:520px) { .shell { padding:20px 12px; } header { align-items:flex-start; flex-direction:column; } .stats { grid-template-columns:1fr 1fr; } .panel { padding:16px; overflow:hidden; } th,td { white-space:nowrap; } }
  </style>
</head>
<body>
<?php if (!$isAuthenticated): ?>
  <main class="login">
    <form class="login-card" method="post">
      <input name="csrf" type="hidden" value="<?= htmlspecialchars((string) $_SESSION['admin_csrf']) ?>">
      <label class="field">Administrator email
        <input name="email" type="email" autocomplete="username" required>
      </label>
      <label class="field">Authenticator code
        <input name="totp" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required>
      </label>
      <img src="captcha.php" alt="Security challenge" width="220" height="58">
      <label class="field">Security answer
        <input name="captcha" type="text" inputmode="numeric" required>
      </label>
      <h1>Carol's Christmas Conifers</h1>
      <p>Administrator dashboard sign in</p>
      <?php if ($error !== ''): ?><p class="error" role="alert"><?= htmlspecialchars($error) ?></p><?php endif; ?>
      <label class="field">Administrator password
        <input name="password" type="password" autocomplete="current-password" required>
      </label>
      <button class="button" type="submit">Sign in</button>
    </form>
  </main>
<?php else: ?>
  <main class="shell">
    <header>
      <div><h1>Carol's Christmas Conifers</h1><span class="live">Live dashboard · updated <span id="updated">now</span></span></div>
      <a href="logout.php">Sign out</a>
    </header>

    <section class="stats" aria-label="Store totals">
      <article class="panel stat"><span>Orders today</span><strong id="ordersToday">0</strong></article>
      <article class="panel stat"><span>Low-stock trees</span><strong id="lowStock">0</strong></article>
      <article class="panel stat"><span>Total orders</span><strong id="ordersTotal">0</strong></article>
      <article class="panel stat"><span>Customers</span><strong id="customersTotal">0</strong></article>
    </section>

    <section class="grid">
      <article class="panel">
        <h2>Orders in the last 14 days</h2>
        <canvas id="ordersChart" role="img" aria-label="Daily orders chart"></canvas>
      </article>
      <article class="panel">
        <h2>Low-stock trees</h2>
        <div id="lowStockList"><p class="empty">Loading inventory...</p></div>
      </article>
      <article class="panel" style="grid-column:1/-1">
        <h2>Recent customers</h2>
        <div style="overflow-x:auto"><table><thead><tr><th>Customer</th><th>Email</th><th>Status</th><th>Registered</th></tr></thead><tbody id="recentCustomers"></tbody></table></div>
      </article>
    </section>
  </main>

  <script>
    const $ = (selector) => document.querySelector(selector);

    function drawChart(labels, values) {
      const canvas = $('#ordersChart');
      const context = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const width = rect.width;
      const height = rect.height;
      const left = 34, right = 12, top = 12, bottom = 32;
      const chartWidth = width - left - right;
      const chartHeight = height - top - bottom;
      const maximum = Math.max(...values, 1);
      context.clearRect(0, 0, width, height);
      context.strokeStyle = '#e6eae3';
      context.fillStyle = '#747d74';
      context.font = '11px system-ui';
      context.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const y = top + chartHeight * i / 4;
        context.beginPath(); context.moveTo(left, y); context.lineTo(width - right, y); context.stroke();
        context.fillText(String(Math.round(maximum * (4 - i) / 4)), left - 7, y + 4);
      }
      const step = chartWidth / Math.max(labels.length - 1, 1);
      context.strokeStyle = '#466b57';
      context.lineWidth = 3;
      context.beginPath();
      values.forEach((value, index) => {
        const x = left + step * index;
        const y = top + chartHeight - (value / maximum * chartHeight);
        index ? context.lineTo(x, y) : context.moveTo(x, y);
      });
      context.stroke();
      context.fillStyle = '#466b57';
      values.forEach((value, index) => {
        const x = left + step * index;
        const y = top + chartHeight - (value / maximum * chartHeight);
        context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill();
      });
      context.fillStyle = '#747d74';
      context.textAlign = 'center';
      labels.forEach((label, index) => {
        if (index % 3 === 0 || index === labels.length - 1) context.fillText(label, left + step * index, height - 8);
      });
    }

    function escapeHtml(value) {
      const node = document.createElement('span');
      node.textContent = value == null ? '' : String(value);
      return node.innerHTML;
    }

    async function refreshDashboard() {
      try {
        const response = await fetch('dashboard-data.php', { cache:'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Dashboard request failed.');
        $('#ordersToday').textContent = data.orders_today;
        $('#lowStock').textContent = data.low_stock_trees;
        $('#ordersTotal').textContent = data.orders_total;
        $('#customersTotal').textContent = data.customers_total;
        $('#updated').textContent = new Date(data.updated_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
        drawChart(data.chart.labels, data.chart.values);

        $('#lowStockList').innerHTML = data.low_stock_items.length
          ? '<table><thead><tr><th>Tree</th><th>Stock</th></tr></thead><tbody>' + data.low_stock_items.map(item =>
              `<tr><td>${escapeHtml(item.name)}</td><td class="stock-low">${item.stock_quantity} left</td></tr>`).join('') + '</tbody></table>'
          : '<p class="empty">No trees are currently low in stock.</p>';

        $('#recentCustomers').innerHTML = data.recent_customers.length
          ? data.recent_customers.map(customer => `<tr><td>${escapeHtml(customer.name)}</td><td>${escapeHtml(customer.email)}</td><td><span class="status ${customer.status}">${escapeHtml(customer.status)}</span></td><td>${escapeHtml(new Date(customer.created_at).toLocaleDateString())}</td></tr>`).join('')
          : '<tr><td colspan="4" class="empty">No customers registered yet.</td></tr>';
      } catch (error) {
        $('#updated').textContent = 'refresh failed';
        console.error(error);
      }
    }

    window.addEventListener('resize', () => refreshDashboard());
    refreshDashboard();
    setInterval(refreshDashboard, 15000);
  </script>
<?php endif; ?>
</body>
</html>
