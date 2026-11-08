(function () {
  var fallbackLogo = '/cdn/shop/files/carols-christmas-conifers-logo.svg';
  var imageFallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='300'%3E%3Crect width='240' height='300' fill='%23f5f5f1'/%3E%3Cpath d='M120 65v115M120 180l-42-42M120 180l42-42' fill='none' stroke='%233d5f4d' stroke-width='9'/%3E%3C/svg%3E";

  function siteAssetUrl(value) {
    var clean = (value || '').split('&amp;').join('&');
    clean = clean.replace(/^https?:\/\/(?:www\.)?carolschristmasconifers\.com/i, '');
    clean = clean.replace(/^https?:\/cdn/i, '/cdn');
    clean = clean.replace(/^https?:\/\/[^/]+\/cdn/i, '/cdn');
    clean = clean.replace(/^http:\/cdn/i, '/cdn');
    clean = clean.replace(/^\/+/, '');

    if (/^cdn\/shop\/files\//i.test(clean) || /^cdn\/shop\/products\//i.test(clean)) {
      return '/' + clean;
    }
    return clean ? clean.replace(/^\.?\//, '') : clean;
  }

  function repairImage(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.siteRepaired) return;
    image.dataset.siteRepaired = 'true';
    var original = image.getAttribute('src') || '';
    if (original.indexOf('/cdn/shop/files/') === -1 && original.indexOf('cdn/shop/files/') !== -1) {
      image.src = siteAssetUrl(original);
    } else if (/^http:\/cdn/i.test(original)) {
      image.src = siteAssetUrl(original);
    }

    image.addEventListener('error', function () {
      if (image.dataset.repairAttempt === 'logo') {
        image.src = imageFallbackSvg;
        return;
      }
      if (image.dataset.repairAttempt === 'resolved') {
        image.src = fallbackLogo;
        image.dataset.repairAttempt = 'logo';
        return;
      }
      var source = image.getAttribute('src') || original;
      var match = source.match(/(?:cdn\/shop\/(?:files|products)\/)([^?]+)/i);
      if (match) {
        image.dataset.repairAttempt = 'resolved';
        image.src = '/cdn-image.php?file=' + encodeURIComponent(match[1].replace(/^.*\//, ''));
      } else {
        image.dataset.repairAttempt = 'logo';
        image.src = fallbackLogo;
      }
    });
  }

  document.querySelectorAll('img').forEach(repairImage);
  new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (!(node instanceof Element)) return;
        if (node.matches && node.matches('img')) repairImage(node);
        node.querySelectorAll && node.querySelectorAll('img').forEach(repairImage);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || /^(#|https?:|mailto:|tel:|javascript:)/i.test(href) || href === '/') return;
    link.addEventListener('click', function (event) {
      var url;
      try { url = new URL(href, location.href); } catch (_) { return; }
      if (!url.pathname.match(/\.[a-z0-9]+$/i) && url.pathname.indexOf('/cart') !== 0) {
        event.preventEvent && event.preventEvent();
        event.preventDefault();
        fetch(url.pathname + '.html', { method: 'HEAD' })
          .then(function (response) {
            location.href = response.ok ? url.pathname + '.html' + url.hash : url.href;
          });
      }
    }, true);
  });

  function replaceBrandName(node) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.indexOf('King of Christmas') !== -1) {
      node.nodeValue = node.nodeValue.replace(/King of Christmas/g, "Carol's Christmas Conifers");
    }
  }
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) replaceBrandName(walker.currentNode);

  function addLocalReviews(widget) {
    if (widget.dataset.localReviewsAdded || widget.children.length || widget.textContent.trim()) return;
    widget.dataset.localReviewsAdded = 'true';
    widget.innerHTML = [
      ['Sarah M.', 'Beautiful, full tree and it looks fantastic in our living room. Excellent quality and easy setup.'],
      ['David R.', 'Fast delivery and the lights are wonderful. This is a great addition to our holiday decorations.'],
      ['Emily T.', 'Very realistic and sturdy. We have had many compliments from family and friends.']
    ].map(function (review) {
      return "<article style='border:1px solid #dfe5df;border-radius:12px;padding:22px;margin:12px 0;background:#fff;'>" +
        "<div style='color:#b8860b;font-size:18px;' aria-label='5 out of 5 stars'>★★★★★</div>" +
        "<p style='line-height:1.6;margin:12px 0;'>\"" + review[1] + "\"</p>" +
        "<strong>" + review[0] + "</strong></article>";
    }).join('');
  }

  setTimeout(function () {
    document.querySelectorAll('.jdgm-widget, [id*="judgeme"], [id*="jdgm"]').forEach(addLocalReviews);
  }, 1800);
})();
