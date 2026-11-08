(() => {
  const storageKey = 'carol-christmas-order';
  const cart = readCart();
  let whatsappNumber = '';
  let configError = '';

  function readCart() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(value)) return [];
      return value.filter((item) =>
        item &&
        typeof item.key === 'string' &&
        typeof item.title === 'string' &&
        Number.isFinite(item.price) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      );
    } catch (error) {
      console.error('Could not read the saved order.', error);
      return [];
    }
  }

  function persistCart() {
    localStorage.setItem(storageKey, JSON.stringify(cart));
    renderCart();
  }

  function money(amount, currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'USD'
      }).format(amount);
    } catch {
      return `${currency || 'USD'} ${amount.toFixed(2)}`;
    }
  }

  function amountFromText(text) {
    const match = String(text || '').replace(/,/g, '').match(/-?\d+(?:\.\d{1,2})?/);
    return match ? Number(match[0]) : NaN;
  }

  function currentProductPrice() {
    const priceElement = document.querySelector(
      '.product-information__grid .main-product__price .price--regular, ' +
      '.product-information__grid .main-product__price .price'
    );
    const visibleAmount = priceElement && amountFromText(priceElement.textContent);
    if (Number.isFinite(visibleAmount)) return visibleAmount;

    const meta = document.querySelector(
      'meta[property="product:price:amount"], meta[property="og:price:amount"]'
    );
    const metaAmount = meta && amountFromText(meta.content);
    if (Number.isFinite(metaAmount)) return metaAmount;

    return NaN;
  }

  function currencyCode() {
    return document.querySelector(
      'meta[property="product:price:currency"], meta[property="og:price:currency"]'
    )?.content || 'USD';
  }

  function addItem(item) {
    const existing = cart.find((line) => line.key === item.key);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    persistCart();
    setStatus(`${item.title} added to your order.`);
  }

  function makeButton(label, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
  }

  function selectedVariantId() {
    return document.querySelector(
      '.product-information__grid form.shopify-product-form [name="id"], ' +
      '.product-information__grid form[action*="/cart/add"] [name="id"]'
    )?.value || 'default';
  }

  function initializeGalleryNavigation(gallery) {
    const controls = gallery.querySelector('slideshow-controls[thumbnails]');
    const thumbnails = controls?.querySelector('scroll-hint');
    if (!controls || !thumbnails || controls.dataset.conifaceScrollControls) return;

    controls.dataset.conifaceScrollControls = 'true';
    controls.classList.add('coniface-gallery-controls');
    controls.classList.add('coniface-gallery-controls--all-visible');

    const makeScrollButton = (direction, label, icon) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'coniface-gallery-scroll';
      button.setAttribute('aria-label', label);
      button.hidden = true;
      button.innerHTML = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${icon}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`;
      button.addEventListener('click', () => {
        thumbnails.scrollBy({
          left: direction * Math.max(100, Math.round(thumbnails.clientWidth * 0.75)),
          behavior: 'smooth'
        });
      });
      return button;
    };

    const previousButton = makeScrollButton(-1, 'Scroll image thumbnails left', 'M12 4.5 6.5 10l5.5 5.5');
    const nextButton = makeScrollButton(1, 'Scroll image thumbnails right', 'M8 4.5 13.5 10 8 15.5');
    controls.insertBefore(previousButton, thumbnails);
    controls.append(nextButton);

    const updateNavigation = () => {
      const canScroll = thumbnails.scrollWidth > thumbnails.clientWidth + 1;
      controls.classList.toggle('coniface-gallery-controls--overflow', canScroll);
      previousButton.hidden = nextButton.hidden = !canScroll;
      previousButton.disabled = thumbnails.scrollLeft <= 1;
      nextButton.disabled = thumbnails.scrollLeft >= thumbnails.scrollWidth - thumbnails.clientWidth - 1;
    };

    thumbnails.addEventListener('scroll', updateNavigation, { passive: true });
    if (typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(updateNavigation);
      resizeObserver.observe(thumbnails);
      const thumbnailRow = thumbnails.querySelector('.slideshow-controls__thumbnails');
      if (thumbnailRow) resizeObserver.observe(thumbnailRow);
    }
    updateNavigation();
  }

  function initializeGalleryNavigationWithin(element) {
    if (!(element instanceof Element)) return;
    if (element.matches('media-gallery')) initializeGalleryNavigation(element);
    element.querySelectorAll('media-gallery').forEach(initializeGalleryNavigation);
    const parentGallery = element.closest('media-gallery');
    if (parentGallery) initializeGalleryNavigation(parentGallery);
  }

  document.querySelectorAll('media-gallery').forEach(initializeGalleryNavigation);
  if (document.body && typeof MutationObserver === 'function') {
    const galleryObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) initializeGalleryNavigationWithin(node);
      }
    });
    galleryObserver.observe(document.body, { childList: true, subtree: true });
  }

  function addProductPageButton() {
    const product = document.querySelector('.product-information__grid');
    if (!product || document.querySelector('[data-order-product-button]')) return;

    const title = product.querySelector('h1')?.textContent.trim();
    const price = currentProductPrice();
    if (!title || !Number.isFinite(price)) return;

    const addToOrder = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const currentPrice = currentProductPrice();
      if (!Number.isFinite(currentPrice)) {
        setStatus('The selected product price could not be read. Please try again.');
        return;
      }
      addItem({
        key: `${location.pathname}::${selectedVariantId()}`,
        title,
        price: currentPrice,
        currency: currencyCode(),
        url: `${location.pathname}${location.search}`
      });
    };

    const form = product.querySelector('form.shopify-product-form, form[action*="/cart/add"]');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      setStatus('Choose Add to order to save this product for WhatsApp checkout.');
    }, true);
    const submitButton = form?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.type = 'button';
      submitButton.textContent = 'Add to order';
      submitButton.removeAttribute('on:click');
      submitButton.dataset.orderProductButton = '';
      submitButton.addEventListener('click', addToOrder, true);
      return;
    }

    const button = makeButton('Add to order', 'button button--primary');
    button.dataset.orderProductButton = '';
    button.addEventListener('click', addToOrder, true);
    const target = form?.closest('.buy-buttons-block') || form;
    if (target) target.insertAdjacentElement('afterend', button);
    else product.append(button);
  }

  function addCollectionCardButtons() {
    const cards = document.querySelectorAll('li.product-grid__item:not(.product-grid__item--banner)');
    for (const card of cards) {
      if (card.querySelector('[data-order-card-button]')) continue;

      const link = [...card.querySelectorAll('a[href]')].find((anchor) => {
        try {
          return new URL(anchor.href, location.href).pathname.includes('/products/');
        } catch {
          return false;
        }
      });
      if (!link) continue;

      const title =
        link.getAttribute('aria-label')?.trim() ||
        card.querySelector('h3, .card__heading, .product-card__title')?.textContent.trim() ||
        card.querySelector('img[alt]')?.alt.trim();
      const priceElement = card.querySelector('.card__price, .price--regular, .price');
      const price = amountFromText(priceElement?.textContent);
      if (!title || !Number.isFinite(price)) continue;

      const productUrl = new URL(link.href, location.href);
      const priceRange = /[-–]/.test(priceElement.textContent);
      const button = makeButton('Add to order', 'button button--primary');
      button.dataset.orderCardButton = '';
      button.addEventListener('click', () => {
        addItem({
          key: productUrl.pathname,
          title: priceRange ? `${title} (starting price)` : title,
          price,
          currency: currencyCode(),
          url: productUrl.pathname
        });
      });

      const cardContent = card.querySelector('.card-information, .card__content, .card');
      if (cardContent) cardContent.append(button);
    }
  }

  const styles = document.createElement('style');
  styles.textContent = `
    .coniface-order-launcher { position: fixed; z-index: 10000; right: 20px; bottom: 20px; }
    .coniface-order-launcher .button { display: inline-flex; align-items: center; gap: 9px; min-height: 48px; padding: 12px 18px; border-radius: 28px; box-shadow: 0 3px 14px #0003; }
    .coniface-order-launcher svg, .coniface-whatsapp-icon { width: 22px; height: 22px; flex: 0 0 auto; }
    .coniface-order-panel { position: fixed; z-index: 10001; right: 20px; bottom: 82px; width: min(390px, calc(100vw - 32px)); max-height: min(70vh, 620px); overflow: auto; padding: 20px; background: #fff; color: #252820; border: 1px solid #d6d6d0; box-shadow: 0 8px 28px #0003; }
    .coniface-order-panel[hidden] { display: none; }
    .coniface-order-panel h2 { margin: 0 0 16px; }
    .coniface-order-line { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 12px 0; border-bottom: 1px solid #deded8; }
    .coniface-order-line-title { font-weight: 600; }
    .coniface-order-line-controls { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; }
    .coniface-order-line-controls input { width: 64px; min-height: 38px; }
    .coniface-order-panel button { cursor: pointer; }
    .coniface-order-total { display: flex; justify-content: space-between; margin: 16px 0; font-weight: 700; }
    .coniface-order-send { width: 100%; }
    .coniface-order-status { margin: 10px 0; }
    .coniface-order-panel a { text-decoration: underline; }
    .coniface-gallery-controls--all-visible .slideshow-controls__thumbnails-container { display: block; width: 100%; overflow: visible; mask-image: none; -webkit-mask-image: none; }
    .coniface-gallery-controls--all-visible .slideshow-controls__thumbnails { display: grid; grid-template-columns: repeat(auto-fill, 60px); gap: 8px; width: 100%; }
    .coniface-gallery-controls--all-visible .slideshow-controls__thumbnail { flex: none; }
    .coniface-gallery-controls--overflow { display: grid; grid-template-columns: 36px minmax(0, 1fr) 36px; align-items: center; gap: 4px; width: 100%; }
    .coniface-gallery-controls--overflow .slideshow-controls__thumbnails-container { min-width: 0; width: 100%; }
    .coniface-gallery-scroll { display: inline-flex; align-items: center; justify-content: center; width: 36px; min-width: 36px; height: 36px; min-height: 36px; padding: 0; border: 1px solid #cfd4cc; border-radius: 50%; background: var(--color-background, #fff); color: var(--color-foreground, #252820); cursor: pointer; touch-action: manipulation; }
    .coniface-gallery-scroll[hidden] { display: none; }
    .coniface-gallery-scroll:disabled { cursor: default; opacity: .4; }
    .coniface-gallery-scroll svg { width: 20px; height: 20px; }
    .coniface-gallery-scroll:focus-visible, .slideshow-controls__thumbnail:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
    @media (max-width: 749px) {
      .coniface-order-launcher { right: 12px; bottom: 12px; }
      .coniface-order-panel { right: 12px; bottom: 72px; }
    }
  `;
  document.head.append(styles);

  const launcher = document.createElement('div');
  launcher.className = 'coniface-order-launcher';
  const openButton = makeButton('', 'button button--primary');
  openButton.setAttribute('aria-expanded', 'false');
  openButton.setAttribute('aria-controls', 'coniface-order-panel');
  openButton.innerHTML = `
    <svg class="coniface-whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" d="M16 2.7A13.1 13.1 0 0 0 4.8 22.6L3 29l6.6-1.7A13.2 13.2 0 1 0 16 2.7Zm0 23.8a10.7 10.7 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.5Zm5.9-8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.8 8.8 0 0 1-2.6-1.6 9.7 9.7 0 0 1-1.8-2.2c-.2-.3 0-.5.2-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.4c.1.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.9.6.8.3 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4s-.3-.3-.6-.4Z"/>
    </svg>
    <span data-order-count>Order (0)</span>
  `;
  launcher.append(openButton);

  const panel = document.createElement('aside');
  panel.id = 'coniface-order-panel';
  panel.className = 'coniface-order-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Your order');
  panel.innerHTML = `
    <h2>Your order</h2>
    <div data-order-lines></div>
    <div class="coniface-order-total"><span>Total</span><span data-order-total></span></div>
    <p class="coniface-order-status" data-order-status aria-live="polite"></p>
    <p data-order-number-notice hidden></p>
    <button class="button button--primary coniface-order-send" type="button" data-order-send>Click to send order on WhatsApp</button>
  `;
  document.body.append(launcher, panel);

  const status = panel.querySelector('[data-order-status]');
  const linesContainer = panel.querySelector('[data-order-lines]');

  function setStatus(message) {
    status.textContent = message;
  }

  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    openButton.querySelector('[data-order-count]').textContent = `Order (${count})`;
    linesContainer.replaceChildren();

    if (cart.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Your order is empty. Add a product to get started.';
      linesContainer.append(empty);
    } else {
      cart.forEach((item, index) => {
        const line = document.createElement('div');
        line.className = 'coniface-order-line';
        const title = document.createElement('span');
        title.className = 'coniface-order-line-title';
        title.textContent = item.title;
        const subtotal = document.createElement('span');
        subtotal.textContent = money(item.price * item.quantity, item.currency);
        const controls = document.createElement('div');
        controls.className = 'coniface-order-line-controls';

        const quantity = document.createElement('input');
        quantity.type = 'number';
        quantity.min = '1';
        quantity.max = '99';
        quantity.step = '1';
        quantity.value = String(item.quantity);
        quantity.setAttribute('aria-label', `Quantity for ${item.title}`);
        quantity.addEventListener('change', () => {
          const value = Number(quantity.value);
          if (!Number.isInteger(value) || value < 1 || value > 99) {
            quantity.value = String(item.quantity);
            setStatus('Enter a quantity between 1 and 99.');
            return;
          }
          item.quantity = value;
          persistCart();
        });

        const remove = makeButton('Remove', 'button button--secondary');
        remove.addEventListener('click', () => {
          cart.splice(index, 1);
          persistCart();
        });

        controls.append('Qty ', quantity, remove);
        line.append(title, subtotal, controls);
        linesContainer.append(line);
      });
    }

    const currency = cart[0]?.currency || 'USD';
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    panel.querySelector('[data-order-total]').textContent = money(total, currency);
    updateCheckoutState();
  }

  function updateCheckoutState() {
    const sendButton = panel.querySelector('[data-order-send]');
    const notice = panel.querySelector('[data-order-number-notice]');
    const validNumber = whatsappNumber.replace(/\D/g, '').length >= 8;
    sendButton.disabled = cart.length === 0 || !validNumber;
    notice.hidden = validNumber;
    notice.replaceChildren();

    if (!validNumber) {
      notice.append(document.createTextNode(
        configError
          ? `Business WhatsApp number is not available: ${configError} `
          : 'WhatsApp checkout is not configured yet. Add the business number in '
      ));
      const link = document.createElement('a');
      link.href = '/admin.html';
      link.textContent = 'Business settings';
      notice.append(link, '.');
    } else if (configError) {
      setStatus(`Could not load WhatsApp settings: ${configError}`);
    }
  }

  openButton.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    openButton.setAttribute('aria-expanded', String(!panel.hidden));
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const target = new URL(link.href, location.href);
    if (!/\/cart(?:\/|$)/i.test(target.pathname)) return;
    event.preventDefault();
    panel.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
  }, true);

  panel.querySelector('[data-order-send]').addEventListener('click', async () => {
    if (cart.length === 0 || whatsappNumber.replace(/\D/g, '').length < 8) return;

    const popup = window.open('about:blank', '_blank');
    const items = cart.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
      url: item.url
    }));
    const currency = cart[0].currency || 'USD';
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setStatus('Saving your order…');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency, total })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);

      const message = [
        'Hello! I would like to place this order:',
        ...items.map((item) =>
          `- ${item.title} × ${item.quantity}: ${money(item.price * item.quantity, currency)}`
        ),
        `Total: ${money(total, currency)}`,
        `Order reference: ${result.id}`
      ].join('\n');
      const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

      if (popup) {
        popup.location.href = url;
      } else {
        setStatus('Your order was saved. Allow pop-ups to open WhatsApp, or use the link below.');
        const fallback = document.createElement('a');
        fallback.href = url;
        fallback.target = '_blank';
        fallback.rel = 'noopener noreferrer';
        fallback.textContent = 'Open WhatsApp with your order';
        status.append(' ', fallback);
      }
      cart.splice(0, cart.length);
      localStorage.removeItem(storageKey);
      renderCart();
      setStatus(`Order ${result.id} saved. Send the prepared message in WhatsApp, then the store can reply with payment methods.`);
    } catch (error) {
      if (popup) popup.close();
      console.error('Could not submit the WhatsApp order.', error);
      setStatus(`Your order was not sent: ${error.message}`);
    }
  });

  addProductPageButton();
  addCollectionCardButtons();
  renderCart();

  fetch('/api/config')
    .then(async (response) => {
      if (!response.ok) throw new Error(`Request failed (${response.status}).`);
      const config = await response.json();
      whatsappNumber = typeof config.whatsappNumber === 'string' ? config.whatsappNumber : '';
      updateCheckoutState();
    })
    .catch((error) => {
      configError = error.message;
      console.error('Could not load business WhatsApp settings.', error);
      updateCheckoutState();
    });
})();