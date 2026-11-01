
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com","https://extensions.shopifycdn.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills-legacy.BjA_XqhN.js","cdn/shopifycloud/checkout-web/assets/c1/app-legacy.DMdN3QJP.js","cdn/shopifycloud/checkout-web/assets/c1/2c1ab0fe-legacy.94Ae8QJv.js","cdn/shopifycloud/checkout-web/assets/c1/6a2fc6d6-legacy.CEsw4dyb.js","cdn/shopifycloud/checkout-web/assets/c1/4c290a1e-legacy.CTRCZGIG.js","cdn/shopifycloud/checkout-web/assets/c1/bb728e1c-legacy.1jFgWwXl.js","cdn/shopifycloud/checkout-web/assets/c1/cf29e63b-legacy.DVcEGKAz.js","cdn/shopifycloud/checkout-web/assets/c1/cb38e5c2-legacy.D7hmfloA.js","cdn/shopifycloud/checkout-web/assets/c1/413b21e2-legacy.Dw1BSA-B.js","cdn/shopifycloud/checkout-web/assets/c1/e477f96c-legacy.CndM1CCr.js","cdn/shopifycloud/checkout-web/assets/c1/2255f8fa-legacy.BIGxxhH_.js","cdn/shopifycloud/checkout-web/assets/c1/b8733b27-legacy.lCQU0wum.js","cdn/shopifycloud/checkout-web/assets/c1/e39bc11c-legacy.DofM9o7g.js","cdn/shopifycloud/checkout-web/assets/c1/08a3b809-legacy.BsV44NSN.js","cdn/shopifycloud/checkout-web/assets/c1/bff2ff9b-legacy.CWhvBd9p.js","cdn/shopifycloud/checkout-web/assets/c1/5fda1420-legacy.BNeph69H.js","cdn/shopifycloud/checkout-web/assets/c1/164ad2e3-legacy.XoSZtj84.js","cdn/shopifycloud/checkout-web/assets/c1/9f047e05-legacy.Du16COXD.js","cdn/shopifycloud/checkout-web/assets/c1/0a7dffce-legacy.COotg-X-.js","cdn/shopifycloud/checkout-web/assets/c1/60a453ce-legacy.C_gvu1Jx.js","cdn/shopifycloud/checkout-web/assets/c1/21cc90a2-legacy.L47G-Njn.js","cdn/shopifycloud/checkout-web/assets/c1/fb3b4968-legacy.B5S6TuBC.js","cdn/shopifycloud/checkout-web/assets/c1/f8706cb6-legacy.Dhsg7qux.js","cdn/shopifycloud/checkout-web/assets/c1/dffdfb34-legacy.CXur1pvJ.js","cdn/shopifycloud/checkout-web/assets/c1/31cc568e-legacy.BqIr0rV3.js","cdn/shopifycloud/checkout-web/assets/c1/0c0ad074-legacy.B2JmEcQH.js","cdn/shopifycloud/checkout-web/assets/c1/53bbdad9-legacy.Cf_Cidze.js","cdn/shopifycloud/checkout-web/assets/c1/945a08d6-legacy.6NDSDi8X.js","cdn/shopifycloud/checkout-web/assets/c1/2fdb3dd3-legacy.B5muoIaJ.js","cdn/shopifycloud/checkout-web/assets/c1/0e67bd3b-legacy.B9O__3s0.js","cdn/shopifycloud/checkout-web/assets/c1/74835653-legacy.CX-1ya5e.js","cdn/shopifycloud/checkout-web/assets/c1/29034f35-legacy.BWluRZ-V.js","cdn/shopifycloud/checkout-web/assets/c1/ac5a19ff-legacy.D2qtRdup.js","cdn/shopifycloud/checkout-web/assets/c1/47b970b2-legacy.CO9U_MVI.js","cdn/shopifycloud/checkout-web/assets/c1/0727407f-legacy.CXV1gUn4.js","cdn/shopifycloud/checkout-web/assets/c1/064f6ac1-legacy.DKTUEAPa.js","cdn/shopifycloud/checkout-web/assets/c1/efa0389a-legacy.C7B3G4iC.js","cdn/shopifycloud/checkout-web/assets/c1/f1968089-legacy.Co-42SP4.js","cdn/shopifycloud/checkout-web/assets/c1/55098bf1-legacy.CVTiqREq.js","cdn/shopifycloud/checkout-web/assets/c1/cb5cf153-legacy.B0GjViPn.js","cdn/shopifycloud/checkout-web/assets/c1/e3e348f2-legacy.CHLxIwFI.js","cdn/shopifycloud/checkout-web/assets/c1/ca5e9c49-legacy.3MTX2EH5.js","cdn/shopifycloud/checkout-web/assets/c1/ed9f2238-legacy.CUYwLSmh.js","cdn/shopifycloud/checkout-web/assets/c1/ccdf3592-legacy.AcdeBLQN.js","cdn/shopifycloud/checkout-web/assets/c1/a422df8c-legacy.CPxnj_3m.js","cdn/shopifycloud/checkout-web/assets/c1/79974aab-legacy.I_lnsyGW.js","cdn/shopifycloud/checkout-web/assets/c1/7b0c98ea-legacy.Sz3qc44v.js","cdn/shopifycloud/checkout-web/assets/c1/d22d2b80-legacy.Cvgef0Jl.js","cdn/shopifycloud/checkout-web/assets/c1/f49d4216-legacy.CeVmR9Wa.js","cdn/shopifycloud/checkout-web/assets/c1/0e9ee714-legacy.BE9O2lhs.js","cdn/shopifycloud/checkout-web/assets/c1/39921a74-legacy.CWTVPFEA.js","cdn/shopifycloud/checkout-web/assets/c1/ec391382-legacy.Bmjaaike.js","cdn/shopifycloud/checkout-web/assets/c1/f3fe2775-legacy.CJ4-lT8B.js","cdn/shopifycloud/checkout-web/assets/c1/598fef4e-legacy.C4wD7Oyi.js","cdn/shopifycloud/checkout-web/assets/c1/e77f7fe0-legacy.C7vHhHnn.js","cdn/shopifycloud/checkout-web/assets/c1/cc6ff67d-legacy.CwwCo_-J.js","cdn/shopifycloud/checkout-web/assets/c1/87bfafec-legacy.BIJg4Nbc.js","cdn/shopifycloud/checkout-web/assets/c1/dfca5da5-legacy.DfspMnCv.js","cdn/shopifycloud/checkout-web/assets/c1/6720fa5f-legacy.CAsgk82q.js","cdn/shopifycloud/checkout-web/assets/c1/01973ac7-legacy.Dkn9qYH5.js","cdn/shopifycloud/checkout-web/assets/c1/58314944-legacy.BxOq2ABo.js","cdn/shopifycloud/checkout-web/assets/c1/7a8217fd-legacy.BUHhtkXX.js","cdn/shopifycloud/checkout-web/assets/c1/2b89a178-legacy.PxdFFS_-.js","cdn/shopifycloud/checkout-web/assets/c1/b684bff6-legacy.DoSj86dR.js","cdn/shopifycloud/checkout-web/assets/c1/910cd6e2-legacy.BA5SG9xu.js","cdn/shopifycloud/checkout-web/assets/c1/347b440c-legacy.Dwvl79O-.js","cdn/shopifycloud/checkout-web/assets/c1/d5d34b3b-legacy.Crl6QeMf.js","cdn/shopifycloud/checkout-web/assets/c1/181d38d3-legacy.BYrH5NHQ.js","cdn/shopifycloud/checkout-web/assets/c1/d6447d9e-legacy.CQViWk0E.js","cdn/shopifycloud/checkout-web/assets/c1/f51e663e-legacy.dl2_ybfg.js","cdn/shopifycloud/checkout-web/assets/c1/64de7b49-legacy.CD8RYlO6.js","cdn/shopifycloud/checkout-web/assets/c1/8e79be58-legacy.Dyqf4lHy.js","cdn/shopifycloud/checkout-web/assets/c1/90e26f5f-legacy.DXOPYrlI.js","cdn/shopifycloud/checkout-web/assets/c1/f3e117aa-legacy.BepVEZxw.js","cdn/shopifycloud/checkout-web/assets/c1/a25deb9a-legacy.BOtbsskl.js","cdn/shopifycloud/checkout-web/assets/c1/7aefefff-legacy.BMx7rFYJ.js","cdn/shopifycloud/checkout-web/assets/c1/a535174a-legacy.DbIXAm8c.js","cdn/shopifycloud/checkout-web/assets/c1/5fd968f2-legacy.jIeIi-Z9.js","cdn/shopifycloud/checkout-web/assets/c1/73a9b0a0-legacy.CBifIDC6.js","cdn/shopifycloud/checkout-web/assets/c1/91319467-legacy.zE-ojWH3.js","cdn/shopifycloud/checkout-web/assets/c1/86720dbb-legacy.BmrwFl5b.js","cdn/shopifycloud/checkout-web/assets/c1/7114e006-legacy.BIgsuTIh.js","cdn/shopifycloud/checkout-web/assets/c1/f692f62f-legacy.C03fNGu1.js","cdn/shopifycloud/checkout-web/assets/c1/e0989459-legacy.B9JOr3bj.js","cdn/shopifycloud/checkout-web/assets/c1/fc21c11a-legacy.8UekEKuh.js","cdn/shopifycloud/checkout-web/assets/c1/4ea44c06-legacy.CkICDWmD.js","cdn/shopifycloud/checkout-web/assets/c1/1ed8f5e3-legacy.CwT131hv.js","cdn/shopifycloud/checkout-web/assets/c1/7ee73f43-legacy.CgYJz2dQ.js","cdn/shopifycloud/checkout-web/assets/c1/c10167e6-legacy.CPPspdwC.js","cdn/shopifycloud/checkout-web/assets/c1/b9c0319a-legacy.BsUHRDnc.js","cdn/shopifycloud/checkout-web/assets/c1/3a819064-legacy.CWbRRp2U.js","cdn/shopifycloud/checkout-web/assets/c1/d2e6a587-legacy.BiBn8rYw.js","cdn/shopifycloud/checkout-web/assets/c1/4b77f49a-legacy.Dk9F8f-V.js","cdn/shopifycloud/checkout-web/assets/c1/66338e00-legacy.2H9SzMuD.js","cdn/shopifycloud/checkout-web/assets/c1/9c384ce8-legacy.C3DLBmP_.js","cdn/shopifycloud/checkout-web/assets/c1/24fcbaf6-legacy.eE6-K97O.js","cdn/shopifycloud/checkout-web/assets/c1/49758c58-legacy.BLTJlwwh.js","cdn/shopifycloud/checkout-web/assets/c1/28ac86c0-legacy.UjAPesLq.js","cdn/shopifycloud/checkout-web/assets/c1/3e6029dd-legacy.BEiU4GGK.js","cdn/shopifycloud/checkout-web/assets/c1/30074413-legacy.CYniT1-F.js","cdn/shopifycloud/checkout-web/assets/c1/9f57d2aa-legacy.tKveYPUB.js","cdn/shopifycloud/checkout-web/assets/c1/8574876b-legacy.C74lMzyR.js","cdn/shopifycloud/checkout-web/assets/c1/33d2e4fc-legacy.CEagpmJU.js","cdn/shopifycloud/checkout-web/assets/c1/27f09e31-legacy.BkglOLSi.js","cdn/shopifycloud/checkout-web/assets/c1/137622f3-legacy.D3_w3MVD.js","cdn/shopifycloud/checkout-web/assets/c1/54bf0ebb-legacy.C8R4Dj5G.js","cdn/shopifycloud/checkout-web/assets/c1/c610ba76-legacy.B2rrxHLX.js","cdn/shopifycloud/checkout-web/assets/c1/2210eadb-legacy.CbrxxALo.js","cdn/shopifycloud/checkout-web/assets/c1/33682ee7-legacy.DmsBv1IJ.js","cdn/shopifycloud/checkout-web/assets/c1/sandbox.DNKTFXG1.worker.js","cdn/shopifycloud/checkout-web/assets/c1/sandbox-2025-07.BNlrLTFV.worker.js","https://extensions.shopifycdn.com/shopifycloud/checkout-web/assets/c1/polyfills-entry-legacy.DwFClagF.worker.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app-baseline.MNN0ihZy.css","cdn/shopifycloud/checkout-web/assets/c1/assets/previous-baseline.KDWseUlH.css","cdn/shopifycloud/checkout-web/assets/c1/assets/helpers-baseline.eriaTAF0.css","cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage-baseline.sIh_ZBal.css","cdn/shopifycloud/checkout-web/assets/c1/assets/VatNumberValidationField-baseline.EoaNXZ0U.css","cdn/shopifycloud/checkout-web/assets/c1/assets/StickyPayButton-baseline.EZxIe2eB.css","cdn/shopifycloud/checkout-web/assets/c1/assets/hasViolationsIgnoringCodes-baseline.8uMzMRUN.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Section-baseline.Bcgrzvng.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Rollup-baseline.9CMn7iLM.css","cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentIcon-baseline.PmYpTy2i.css","cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayProgressIntercepts-baseline.UdAEA1GN.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Choice-baseline.gzPXXyFy.css","cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentLine-baseline.S1reXcL3.css","cdn/shopifycloud/checkout-web/assets/c1/assets/BillingAddressForm-baseline.jkjtwu_V.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Switch-baseline.O_ZeZqfJ.css","cdn/shopifycloud/checkout-web/assets/c1/assets/EmptyState-baseline.fwNl_uIB.css","cdn/shopifycloud/checkout-web/assets/c1/assets/index-baseline.80JooC9H.css","cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName-baseline.wtmFvPD5.css","cdn/shopifycloud/checkout-web/assets/c1/assets/PhoneField-baseline.N9hX6Zu3.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Middot-baseline.lHcDGreU.css","cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingLines-baseline.RrL0h7rJ.css","cdn/shopifycloud/checkout-web/assets/c1/assets/EstimatedDeliveryContent-baseline.TOOOkbrD.css","cdn/shopifycloud/checkout-web/assets/c1/assets/TransitionHeight-baseline.rSY-r7ZQ.css","cdn/shopifycloud/checkout-web/assets/c1/assets/BelowTheFoldContent-baseline.T-THk34r.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Captcha-baseline.MnCvwSQ9.css","cdn/shopifycloud/checkout-web/assets/c1/assets/RememberMeSection-baseline.mZdJPZY9.css","cdn/shopifycloud/checkout-web/assets/c1/assets/PayButtonSection-baseline.Aui2WPvz.css","cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentOptionSelector-baseline.CewbyU2C.css","cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentMethodProgressionHost-baseline.R9P6mpHy.css","cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary-baseline.Gwj4iIhe.css","cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentButtons-baseline.AlZoPJFF.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Popover-baseline.ghX6U19X.css","cdn/shopifycloud/checkout-web/assets/c1/assets/floating-layer-baseline.YVxM9I-9.css","cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethodSelector-baseline.nkFmN9aA.css","cdn/shopifycloud/checkout-web/assets/c1/assets/SubscriptionPriceBreakdown-baseline.MMTIiETd.css","cdn/shopifycloud/checkout-web/assets/c1/assets/MissingFields-baseline.yfH6caB-.css","cdn/shopifycloud/checkout-web/assets/c1/assets/RedirectionNotice-baseline.3pJ5vAoD.css","cdn/shopifycloud/checkout-web/assets/c1/assets/RuntimeExtension-baseline.HpWSiihS.css","cdn/shopifycloud/checkout-web/assets/c1/assets/AnnouncementRuntimeExtensions-baseline.rcScVgGL.css","cdn/shopifycloud/checkout-web/assets/c1/assets/QRCode-baseline.Kwys1B_4.css","cdn/shopifycloud/checkout-web/assets/c1/assets/Pressable-baseline.YZCMg-Cz.css","cdn/shopifycloud/checkout-web/assets/c1/assets/DateField-baseline.wIDeRzt2.css","cdn/shopifycloud/checkout-web/assets/c1/assets/NumberField-baseline.oJ_hSYW2.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Sheet-baseline.W8PwOc7e.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0130/8226/3616/files/King_of_Christmas-logo_1_713e8404-2aff-456c-906b-d6c8e25928a2_x320.png?v=1722012254"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  