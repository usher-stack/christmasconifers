(function () {
  var storageKey = 'christmasConifersCart';

  function read() {
    try {
      var cart = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: items }));
  }

  function money(value) {
    return '$' + Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function imageFallback() {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="300"%3E%3Crect width="240" height="300" fill="%23f5f5f1"/%3E%3Ctext x="120" y="150" text-anchor="middle" fill="%23687873"%3EProduct%3C/text%3E%3C/svg%3E';
  }

  window.SiteCart = {
    get: read,
    add: function (item) {
      var items = read();
      var existing = items.find(function (entry) {
        return entry.id === item.id;
      });

      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({
          id: item.id || item.url,
          title: item.title || 'Christmas product',
          price: Number(item.price) || 0,
          image: item.image || '',
          url: item.url || '',
          quantity: 1
        });
      }
      write(items);
    },
    remove: function (id) {
      write(read().filter(function (item) { return item.id !== id; }));
    },
    render: function (container, subtotalElement) {
      var items = read();
      if (!items.length) {
        container.innerHTML = '<div class="cart-empty"><h2>Your cart is empty</h2>' +
          '<p>Explore our collection and find the perfect Christmas tree.</p>' +
          '<a class="continue-link" href="../index.php">Continue Shopping</a></div>';
        if (subtotalElement) subtotalElement.textContent = money(0);
        return;
      }

      container.innerHTML = items.map(function (item, index) {
        return '<article class="cart-item">' +
          '<img src="' + item.image + '" alt="' + item.title + '" onerror="this.onerror=null;this.src=\'' + imageFallback() + '\'">' +
          '<div><h2>' + item.title + '</h2><div class="cart-price">' + money(item.price) + '</div>' +
          '<p>Quantity: ' + item.quantity + '</p></div>' +
          '<div class="cart-item-actions"><button class="remove-item" type="button" data-cart-index="' + index + '">Remove</button></div></article>';
      }).join('');

      var subtotal = items.reduce(function (total, item) {
        return total + Number(item.price) * Number(item.quantity);
      }, 0);
      if (subtotalElement) subtotalElement.textContent = money(subtotal);

      container.querySelectorAll('[data-cart-index]').forEach(function (button) {
        button.addEventListener('click', function () {
          SiteCart.remove(items[Number(button.dataset.cartIndex)].id);
          SiteCart.render(container, subtotalElement);
        });
      });
    }
  };
}());
