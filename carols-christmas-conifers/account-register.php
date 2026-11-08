<?php
require_once __DIR__ . '/admin/config.php';
session_start();
$message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    $country = $_POST['country_code'] ?? '';
    $city = trim($_POST['city'] ?? '');
    $street = trim($_POST['street'] ?? '');
    $phone = trim($_POST['phone'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = "Invalid email";
    } elseif ($password !== $confirm) {
        $message = "Passwords don't match";
    } elseif (strlen($password) < 6) {
        $message = "Password too short";
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = database()->prepare("INSERT INTO customers (name, email, password_hash, country_code, city, street, phone) VALUES (?,?,?,?,?,?,?)");
            $stmt->execute([$email, $email, $hash, $country, $city, $street, $phone]);
            $message = "Account created! Now <a href='account-login.php'>Login</a>";
        } catch (PDOException $e) {
            $message = "Email already exists or error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Register - Carol's Christmas</title>
<style>
*{box-sizing:border-box}
body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px 16px;background:#f5f5ef;color:#252820;font-family:Arial,sans-serif}
.account-card{width:min(100%,620px);padding:38px;border:1px solid #e1e4dc;border-radius:16px;background:#fff;box-shadow:0 18px 45px rgba(38,53,43,.12)}
.brand{text-align:center;margin-bottom:26px;color:#27392d}.brand-mark{font-size:36px}.brand h1{margin:8px 0 6px;font-size:32px;letter-spacing:-.04em}.brand p{margin:0;color:#687064}
.message{margin:18px 0;padding:12px;border-radius:8px;background:#f2f5ef;color:#42523e;font-weight:600;text-align:center}
label{display:block;margin-top:16px;color:#39453a;font-size:14px;font-weight:700}
input,select{width:100%;min-height:48px;margin-top:8px;padding:11px 12px;border:1px solid #cfd6cb;border-radius:8px;background:#fff;font:inherit;color:#252820}
input:focus,select:focus{border-color:#4d5d45;outline:3px solid rgba(77,93,69,.15)}
.password-row{position:relative}.password-row input{padding-right:115px}.toggle{position:absolute;right:12px;bottom:14px;color:#42523e;font-size:12px;cursor:pointer}
button{width:100%;min-height:48px;margin-top:24px;border:0;border-radius:8px;background:#4d5d45;color:#fff;font:inherit;font-weight:700;cursor:pointer}button:hover{background:#3d4c37}
.account-footer{margin:22px 0 0;color:#626b60;text-align:center}a{color:#42523e;font-weight:700;text-underline-offset:3px}
@media(max-width:560px){.account-card{padding:28px 20px}.brand h1{font-size:28px}}
</style>
</head>
<body>
<main class="account-card">
<div class="brand"><div class="brand-mark">🎄</div><h1>Create an account</h1><p>Carol's Christmas Conifers</p></div>
<?php if($message): ?><p><b><?= $message ?></b></p><?php endif; ?>
<form method="POST">
<input type="email" name="email" placeholder="Email" required>
<div class="password-row"><input type="password" name="password" id="p1" placeholder="Password" required><span class="toggle" onclick="togglePassword('p1',this)">Show password</span></div>
<div class="password-row"><input type="password" name="confirm_password" id="p2" placeholder="Confirm Password" required><span class="toggle" onclick="togglePassword('p2',this)">Show password</span></div>

<select name="country_code" required>
<option value="">Select Country</option>
<option value="+1">🇺🇸 United States +1</option>
<option value="+1">🇨🇦 Canada +1</option>
<option value="+52">🇲🇽 Mexico +52</option>
<option value="+55">🇧🇷 Brazil +55</option>
<option value="+54">🇦🇷 Argentina +54</option>
<option value="+56">🇨🇱 Chile +56</option>
<option value="+57">🇨🇴 Colombia +57</option>
<option value="+44">🇬🇧 United Kingdom +44</option>
<option value="+353">🇮🇪 Ireland +353</option>
<option value="+33">🇫🇷 France +33</option>
<option value="+49">🇩🇪 Germany +49</option>
<option value="+39">🇮🇹 Italy +39</option>
<option value="+34">🇪🇸 Spain +34</option>
<option value="+351">🇵🇹 Portugal +351</option>
<option value="+31">🇳🇱 Netherlands +31</option>
<option value="+32">🇧🇪 Belgium +32</option>
<option value="+41">🇨🇭 Switzerland +41</option>
<option value="+43">🇦🇹 Austria +43</option>
<option value="+46">🇸🇪 Sweden +46</option>
<option value="+47">🇳🇴 Norway +47</option>
<option value="+45">🇩🇰 Denmark +45</option>
<option value="+358">🇫🇮 Finland +358</option>
<option value="+48">🇵🇱 Poland +48</option>
<option value="+420">🇨🇿 Czechia +420</option>
<option value="+91">🇮🇳 India +91</option>
<option value="+86">🇨🇳 China +86</option>
<option value="+81">🇯🇵 Japan +81</option>
<option value="+82">🇰🇷 South Korea +82</option>
<option value="+61">🇦🇺 Australia +61</option>
<option value="+64">🇳🇿 New Zealand +64</option>
</select>
<input type="text" name="city" placeholder="City (e.g. London)" required>
<input type="text" name="street" placeholder="Street (e.g. Oxford Street)" required>
<input type="text" name="phone" placeholder="Phone number" required>
<button type="submit">Register</button>
</form>
<p class="account-footer">Already have an account? <a href="account-login.php">Sign in</a></p>
</main>
<script>
function togglePassword(id, control) {
  const input = document.getElementById(id);
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  control.textContent = visible ? 'Show password' : 'Hide password';
}
</script>
</body>
</html>