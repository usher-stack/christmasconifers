<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cart</title>
  <link rel="stylesheet" href="../csm_global.css">
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: Georgia, "Times New Roman", serif; background: #f5f5f1; color: #193a2e; }
    .cart-shell { max-width: 1180px; margin: 0 auto; padding: 48px 24px 72px; }
    .cart-heading { margin: 0 0 8px; font-size: clamp(36px, 5vw, 58px); font-weight: 500; }
    .cart-subtitle { margin: 0 0 34px; color: #687b73; }
    .cart-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 28px; align-items: start; }
    .cart-items, .cart-summary { background: #fff; border-radius: 16px; box-shadow: 0 12px 35px rgba(25, 58, 46, .08); }
    .cart-items { padding: 8px 24px; }
    .cart-item { display: grid; grid-template-columns: 120px 1fr auto; gap: 20px; align-items: center; padding: 22px 0; border-bottom: 1px solid #e7e9e5; }
    .cart-item:last-child { border-bottom: 0; }
    .cart-item img { width: 120px; height: 150px; object-fit: contain; background: #f5f5f1; border-radius: 10px; }
    .cart-item h2 { margin: 0 0 8px; font-size: 20px; }
    .cart-price { font-weight: bold; }
    .remove-item { border: 0; background: transparent; color: #7a2e2e; cursor: pointer; text-decoration: underline; }
    .cart-summary { position: sticky; top: 24px; padding: 28px; }
    .cart-summary h2 { margin-top: 0; }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 0; }
    .cart-empty { padding: 60px 24px; text-align: center; }
    .continue-link, .checkout-button { display: inline-block; border-radius: 999px; padding: 14px 24px; text-decoration: none; color: #fff; background: #193a2e; }
    .checkout-button { width: 100%; box-sizing: border-box; border: 0; font: inherit; cursor: pointer; text-align: center; }
    @media (max-width: 800px) { .cart-layout { grid-template-columns: 1fr; } .cart-summary { position: static; } .cart-item { grid-template-columns: 90px 1fr; } .cart-item img { width: 90px; height: 115px; } .cart-item-actions { grid-column: 2; } }
  </style>
</head>
<body>
  <main class="cart-shell">
    <h1 class="cart-heading">Your Cart</h1>
    <p class="cart-subtitle">Thoughtfully selected for a beautiful Christmas.</p>
    <div class="cart-layout" id="cart-layout">
      <section class="cart-items" id="cart-items" aria-live="polite"></section>
      <aside class="cart-summary" id="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-row"><span>Subtotal</span><strong id="cart-subtotal">$0.00</strong></div>
        <div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
        <button class="checkout-button" type="button">Proceed to Checkout</button>
      </aside>
    </div>
  </main>
  <script src="../cart.js"></script>
  <script>
    window.SiteCart.render(document.getElementById('cart-items'), document.getElementById('cart-subtotal'));
  </script>
</body>
</html>
