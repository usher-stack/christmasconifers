const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const siteRoot = path.join(root, 'www.kingofchristmas.com');
const dataRoot = process.env.DATA_DIR || path.join(root, 'data');
const ordersFile = path.join(dataRoot, 'orders.json');
const accountsFile = path.join(dataRoot, 'accounts.json');
const settingsFile = path.join(dataRoot, 'store-settings.json');
const port = Number(process.env.PORT || 3000);
const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(18).toString('base64url');
const adminSessions = new Map();
const customerSessions = new Map();
const sessionLifetime = 8 * 60 * 60 * 1000;
const statuses = new Set(['pending', 'approved', 'declined', 'completed']);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

fs.mkdirSync(dataRoot, { recursive: true });
for (const [file, initial] of [
  [ordersFile, []],
  [accountsFile, []],
  [settingsFile, { whatsappNumber: '' }]
]) {
  if (!fs.existsSync(file)) writeJson(file, initial);
}

if (!process.env.ADMIN_PASSWORD) {
  console.log(`Initial admin password (save it before closing this terminal): ${adminPassword}`);
}

function writeJson(file, value) {
  const temporary = `${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, file);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(JSON.stringify(value));
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.cookie || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return '';
}

function sessionFor(request, sessions) {
  const token = cookieValue(request, sessions === adminSessions ? 'store_admin' : 'store_customer');
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + sessionLifetime;
  return session;
}

function sessionCookie(name, token, request, maxAge = sessionLifetime / 1000) {
  const secure = request.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}

function requireAdmin(request, response) {
  const session = sessionFor(request, adminSessions);
  if (!session) {
    sendJson(response, 401, { error: 'Sign in as an administrator to continue.' });
    return null;
  }
  return session;
}

function requireCustomer(request, response) {
  const session = sessionFor(request, customerSessions);
  if (!session) {
    sendJson(response, 401, { error: 'Sign in to continue.' });
    return null;
  }
  const accounts = readJson(accountsFile);
  const account = accounts.find((item) => item.id === session.accountId);
  if (!account || account.status !== 'active') {
    customerSessions.delete(cookieValue(request, 'store_customer'));
    sendJson(response, 403, { error: 'This account is suspended or unavailable.' });
    return null;
  }
  return account;
}

function readBody(request, response) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    let tooLarge = false;
    request.on('data', (chunk) => {
      length += chunk.length;
      if (length > 64 * 1024) {
        tooLarge = true;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    request.on('end', () => {
      if (tooLarge) {
        const error = new Error('Request body is too large.');
        error.status = 413;
        reject(error);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (cause) {
        const error = new Error('Request body must be valid JSON.', { cause });
        error.status = 400;
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function normalizeOrder(body) {
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
    throw new Error('An order must contain between 1 and 50 products.');
  }
  const currency = typeof body.currency === 'string' ? body.currency : 'USD';
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Currency code is invalid.');

  const items = body.items.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const productUrl = typeof item.url === 'string' ? item.url : '';
    if (!title || title.length > 300) throw new Error('A product name is missing or too long.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('Product quantity must be between 1 and 99.');
    }
    if (!Number.isFinite(price) || price < 0 || price > 10000000) {
      throw new Error('A product price is invalid.');
    }
    if (!productUrl.startsWith('/') || productUrl.startsWith('//')) {
      throw new Error('A product URL is invalid.');
    }
    return { title, quantity, price, currency, url: productUrl };
  });

  const total = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  return { items, currency, total };
}

function passwordHash(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function constantTimeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function accountPublicView(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    country: account.country,
    countryCode: account.countryCode,
    phone: account.phone,
    status: account.status,
    createdAt: account.createdAt
  };
}

async function handleApi(request, response, url) {
  const method = request.method || 'GET';
  const pathname = url.pathname;

  if (method === 'GET' && pathname === '/api/config') {
    const settings = readJson(settingsFile);
    sendJson(response, 200, { whatsappNumber: settings.whatsappNumber || '' });
    return;
  }

  if (method === 'POST' && pathname === '/api/orders') {
    const body = await readBody(request, response);
    let order;
    try {
      order = normalizeOrder(body);
    } catch (error) {
      sendJson(response, 400, { error: error.message });
      return;
    }
    order.id = crypto.randomBytes(6).toString('hex').toUpperCase();
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    const orders = readJson(ordersFile);
    orders.unshift(order);
    writeJson(ordersFile, orders);

    if (process.env.STORE_API_URL && process.env.STORE_API_TOKEN) {
      try {
        const mysqlResponse = await fetch(process.env.STORE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Store-API-Token': process.env.STORE_API_TOKEN
          },
          body: JSON.stringify({
            reference: order.id,
            total: order.total,
            currency: order.currency,
            items: order.items
          })
        });
        if (!mysqlResponse.ok) throw new Error('MySQL order synchronization failed.');
      } catch (error) {
        sendJson(response, 503, { error: 'The order was not sent because the order database is unavailable. Please try again.' });
        return;
      }
    }
    sendJson(response, 201, { id: order.id, status: order.status });
    return;
  }

  if (method === 'POST' && pathname === '/api/account/register') {
    const body = await readBody(request, response);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const country = typeof body.country === 'string' ? body.country.trim() : '';
    const countryCode = typeof body.countryCode === 'string' ? body.countryCode.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
      sendJson(response, 400, { error: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 10 || password.length > 200) {
      sendJson(response, 400, { error: 'Use a password between 10 and 200 characters.' });
      return;
    }
    if (!name || name.length > 120 || !country || country.length > 80 ||
      !/^\+\d{1,4}$/.test(countryCode) || !/^[\d\s().-]{4,25}$/.test(phone)) {
      sendJson(response, 400, { error: 'Complete your name and international phone details.' });
      return;
    }
    const accounts = readJson(accountsFile);
    if (accounts.some((account) => account.email === email)) {
      sendJson(response, 409, { error: 'An account already exists for this email.' });
      return;
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const account = {
      id: crypto.randomBytes(12).toString('hex'),
      name,
      email,
      country,
      countryCode,
      phone,
      salt,
      passwordHash: passwordHash(password, salt),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    accounts.push(account);
    writeJson(accountsFile, accounts);
    const token = crypto.randomBytes(32).toString('hex');
    customerSessions.set(token, { accountId: account.id, expiresAt: Date.now() + sessionLifetime });
    sendJson(response, 201, { account: accountPublicView(account) }, {
      'Set-Cookie': sessionCookie('store_customer', token, request)
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/account/login') {
    const body = await readBody(request, response);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const account = readJson(accountsFile).find((item) => item.email === email);
    if (!account || !constantTimeEqual(account.passwordHash, passwordHash(password, account.salt))) {
      sendJson(response, 401, { error: 'Email or password is incorrect.' });
      return;
    }
    if (account.status !== 'active') {
      sendJson(response, 403, { error: 'This account is suspended. Contact the store for help.' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    customerSessions.set(token, { accountId: account.id, expiresAt: Date.now() + sessionLifetime });
    sendJson(response, 200, { account: accountPublicView(account) }, {
      'Set-Cookie': sessionCookie('store_customer', token, request)
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/account/me') {
    const account = requireCustomer(request, response);
    if (account) sendJson(response, 200, { account: accountPublicView(account) });
    return;
  }

  if (method === 'POST' && pathname === '/api/account/logout') {
    customerSessions.delete(cookieValue(request, 'store_customer'));
    sendJson(response, 200, { ok: true }, {
      'Set-Cookie': sessionCookie('store_customer', '', request, 0)
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/login') {
    const body = await readBody(request, response);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!constantTimeEqual(password, adminPassword)) {
      sendJson(response, 401, { error: 'Administrator password is incorrect.' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, { expiresAt: Date.now() + sessionLifetime });
    sendJson(response, 200, { ok: true }, {
      'Set-Cookie': sessionCookie('store_admin', token, request)
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/logout') {
    adminSessions.delete(cookieValue(request, 'store_admin'));
    sendJson(response, 200, { ok: true }, {
      'Set-Cookie': sessionCookie('store_admin', '', request, 0)
    });
    return;
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!requireAdmin(request, response)) return;

    if (method === 'GET' && pathname === '/api/admin/orders') {
      sendJson(response, 200, { orders: readJson(ordersFile) });
      return;
    }
    if (method === 'GET' && pathname === '/api/admin/accounts') {
      sendJson(response, 200, {
        accounts: readJson(accountsFile).map(accountPublicView)
      });
      return;
    }
    if (method === 'PUT' && pathname === '/api/admin/config') {
      const body = await readBody(request, response);
      const rawNumber = typeof body.whatsappNumber === 'string' ? body.whatsappNumber.trim() : '';
      const digits = rawNumber.replace(/\D/g, '');
      if (rawNumber && (digits.length < 8 || digits.length > 15)) {
        sendJson(response, 400, { error: 'Enter a WhatsApp number with country code (8–15 digits).' });
        return;
      }
      writeJson(settingsFile, { whatsappNumber: digits });
      sendJson(response, 200, { whatsappNumber: digits });
      return;
    }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/orders/')) {
      const id = pathname.slice('/api/admin/orders/'.length);
      const body = await readBody(request, response);
      if (!statuses.has(body.status)) {
        sendJson(response, 400, { error: 'Choose a valid order status.' });
        return;
      }
      const orders = readJson(ordersFile);
      const order = orders.find((item) => item.id === id);
      if (!order) {
        sendJson(response, 404, { error: 'Order not found.' });
        return;
      }
      order.status = body.status;
      order.updatedAt = new Date().toISOString();
      writeJson(ordersFile, orders);
      sendJson(response, 200, { order });
      return;
    }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/accounts/')) {
      const id = pathname.slice('/api/admin/accounts/'.length);
      const body = await readBody(request, response);
      if (body.status !== 'active' && body.status !== 'suspended') {
        sendJson(response, 400, { error: 'Choose active or suspended status.' });
        return;
      }
      const accounts = readJson(accountsFile);
      const account = accounts.find((item) => item.id === id);
      if (!account) {
        sendJson(response, 404, { error: 'Account not found.' });
        return;
      }
      account.status = body.status;
      writeJson(accountsFile, accounts);
      for (const [token, session] of customerSessions) {
        if (session.accountId === id && body.status === 'suspended') customerSessions.delete(token);
      }
      sendJson(response, 200, { account: accountPublicView(account) });
      return;
    }
    sendJson(response, 404, { error: 'Admin endpoint not found.' });
    return;
  }

  sendJson(response, 404, { error: 'API endpoint not found.' });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
      return;
    }

    let pathname = decodeURIComponent(url.pathname);
    pathname = pathname.replace(/^\/www\.kingofchristmas\.com(?=\/|$)/i, '');
    if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin.html';
    if (pathname.startsWith('/account') && !path.extname(pathname)) pathname = '/account.html';
    if (!pathname || pathname === '/') pathname = '/index.html';
    const file = path.resolve(siteRoot, `.${pathname}`);
    if (file !== siteRoot && !file.startsWith(`${siteRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) {
        response.writeHead(404);
        response.end('Not Found');
        return;
      }
      response.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Length': stat.size,
        'Content-Type': mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff'
      });
      fs.createReadStream(file).pipe(response);
    });
  } catch (error) {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }
    const status = error.status || 500;
    sendJson(response, status, {
      error: status === 413
        ? 'Request body is too large.'
        : status === 400
          ? 'Request body must be valid JSON.'
          : 'The request could not be completed.'
    });
    if (status === 500) console.error('Storefront request failed.', error);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Storefront running at http://127.0.0.1:${port}`);
  console.log('For a public deployment, run behind HTTPS and configure ADMIN_PASSWORD.');
});