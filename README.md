# Carol's Christmas Coniface storefront

## Run locally

Use Node.js 18 or later:

```powershell
$env:ADMIN_PASSWORD = "choose-a-long-private-password"
node .\server.js
```

Open `http://127.0.0.1:3000`. The storefront API and admin dashboard must be served by this Node server; a static preview server cannot save orders or account changes.

If `ADMIN_PASSWORD` is not set, the server creates a temporary administrator password and prints it in the terminal. Set your own password before restarting so the administrator login remains stable.

## Configure WhatsApp orders

Open `http://127.0.0.1:3000/admin.html`, sign in, and enter the business WhatsApp number in international format, including the country calling code. Until a number is saved, the WhatsApp checkout button remains disabled.

Customers can add products from product pages or collection cards. Their order and total are saved locally before WhatsApp opens with a prepared message. Admins can review and update order status in the dashboard.

## Customer accounts and data

Sign-up and sign-in are available at `/account.html`. Account details, password hashes, storefront settings, and submitted orders are stored under `data/`. Keep that folder private and back it up securely.

The built-in server is intended for local development. A public deployment must use HTTPS, a private `ADMIN_PASSWORD`, persistent protected storage, and an HTTPS reverse proxy. Do not expose the development server directly to the internet.

## MySQL PHP dashboard

A real-time PHP/MySQL dashboard is available at `admin/index.php` on a PHP-enabled server.

1. Import `www.kingofchristmas.com/admin/schema.sql` into MySQL.
2. Configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in the PHP server environment.
3. Configure either `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` in the PHP server environment.
4. Open `/admin/index.php`. The dashboard refreshes every 15 seconds and shows orders today, low-stock trees, recent customers, totals, and a 14-day chart.

Example environment values are listed in `.env.admin.example`. This dashboard is independent of the Node JSON server and must be hosted by PHP with the PDO MySQL extension enabled.