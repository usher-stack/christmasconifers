<?php
require_once __DIR__ . '/admin/config.php';
session_start();
$msg="";
if($_SERVER['REQUEST_METHOD']==='POST'){
 $email=trim($_POST['email']); $pass=$_POST['password'];
 $stmt=database()->prepare("SELECT * FROM customers WHERE email=?");
 $stmt->execute([$email]); $u=$stmt->fetch();
 if($u && password_verify($pass,$u['password_hash'])){
  $_SESSION['customer_id']=$u['id'];
  $_SESSION['customer_name']=$u['name'] ?? $u['email'];
  header("Location: index.php");
  exit;
 } else { $msg="Wrong email or password"; }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in | Carol's Christmas Conifers</title>
  <style>
    * { box-sizing: border-box; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px 16px; background: #f5f5ef; color: #252820; font-family: Arial, sans-serif; }
    .account-card { width: min(100%, 520px); padding: 38px; border: 1px solid #e1e4dc; border-radius: 16px; background: #fff; box-shadow: 0 18px 45px rgba(38,53,43,.12); }
    .brand { margin-bottom: 28px; color: #27392d; text-align: center; }
    .brand-mark { font-size: 36px; }
    h1 { margin: 8px 0 6px; font-size: 32px; letter-spacing: -.04em; }
    .brand p { margin: 0; color: #687064; }
    .message { margin: 18px 0; padding: 12px; border-radius: 8px; background: #fff1f1; color: #9b2c2c; font-weight: 600; text-align: center; }
    label { display: block; margin-top: 18px; color: #39453a; font-size: 14px; font-weight: 700; }
    .password-row { position: relative; display: block; }
    .password-row input { padding-right: 115px; }
    .password-toggle { position: absolute; right: 12px; bottom: 14px; border: 0; background: transparent; color: #42523e; font-size: 12px; font-weight: 700; cursor: pointer; }
    input { width: 100%; min-height: 48px; margin-top: 8px; padding: 11px 12px; border: 1px solid #cfd6cb; border-radius: 8px; font: inherit; }
    input:focus { border-color: #4d5d45; outline: 3px solid rgba(77,93,69,.15); }
    button { width: 100%; min-height: 48px; margin-top: 24px; border: 0; border-radius: 8px; background: #4d5d45; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
    button:hover { background: #3d4c37; }
    .account-footer { margin: 22px 0 0; color: #626b60; text-align: center; }
    a { color: #42523e; font-weight: 700; text-underline-offset: 3px; }
    @media (max-width: 560px) { .account-card { padding: 28px 20px; } h1 { font-size: 28px; } }
  </style>
</head>
<body>
  <main class="account-card">
    <div class="brand">
      <div class="brand-mark">🎄</div>
      <h1>Welcome back</h1>
      <p>Carol's Christmas Conifers</p>
    </div>
    <?php if($msg): ?><p class="message"><?= htmlspecialchars($msg) ?></p><?php endif; ?>
    <form method="POST">
      <label>Email
        <input type="email" name="email" autocomplete="email" required>
      </label>
      <label>Password
        <span class="password-row">
          <input type="password" id="login-password" name="password" autocomplete="current-password" required>
          <button class="password-toggle" type="button" onclick="togglePassword()">Show password</button>
        </span>
      </label>
      <button type="submit">Sign in</button>
    </form>
    <p class="account-footer">New here? <a href="account-register.php">Create an account</a></p>
  </main>
  <script>
    function togglePassword() {
      const input = document.getElementById('login-password');
      const button = document.querySelector('.password-toggle');
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.textContent = visible ? 'Show password' : 'Hide password';
    }
  </script>
</body>
</html>
