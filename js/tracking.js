/**
 * Meta Pixel & Conversion Event Tracking
 * Confluenc Quant Indicator [v6.1.12]
 * 
 * Supports Meta Pixel tracking cleanly and safely:
 * - Reads Pixel ID from window.CONFLUENC_CONFIG.tracking.metaPixelId or window.META_PIXEL_ID
 * - Fires standard 'PageView' and 'ViewContent' once on initial page load
 * - Fires 'InitiateCheckout' when a verified purchase CTA is clicked
 * - Enforces duplicate event prevention via event deduplication keys
 * - NEVER fires 'Purchase' event on CTA click (Purchase should only be fired on official post-payment confirmation)
 */

(function () {
  'use strict';

  const Tracking = {
    initialized: false,
    firedEvents: new Set(),

    init: function () {
      const config = window.CONFLUENC_CONFIG?.tracking || {};
      const pixelId = config.metaPixelId || window.META_PIXEL_ID || '';

      // Only initialize if a valid pixel ID is supplied
      if (pixelId && typeof pixelId === 'string' && pixelId.trim() !== '') {
        this.injectMetaPixel(pixelId.trim());
        this.trackPageView();
        this.trackViewContent();
      } else {
        if (config.debug) {
          console.info(
            '[Tracking] Meta Pixel ID is not configured. To enable tracking, add your Meta Pixel ID to CONFLUENC_CONFIG.tracking.metaPixelId in js/config.js.'
          );
        }
      }

      this.bindCtaListeners();
    },

    injectMetaPixel: function (pixelId) {
      if (window.fbq) return;

      /* Meta Pixel Base Code */
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pixelId);
      this.initialized = true;

      if (window.CONFLUENC_CONFIG?.tracking?.debug) {
        console.log(`[Tracking] Meta Pixel initialized with ID: ${pixelId}`);
      }
    },

    trackPageView: function () {
      if (!this.initialized || !window.fbq) return;
      if (this.firedEvents.has('PageView')) return;

      window.fbq('track', 'PageView');
      this.firedEvents.add('PageView');

      if (window.CONFLUENC_CONFIG?.tracking?.debug) {
        console.log('[Tracking] Fired PageView');
      }
    },

    trackViewContent: function () {
      if (!this.initialized || !window.fbq) return;
      if (this.firedEvents.has('ViewContent')) return;

      const product = window.CONFLUENC_CONFIG?.product || {};
      window.fbq('track', 'ViewContent', {
        content_name: product.name || 'Confluenc Quant Indicator [v6.1.12]',
        content_category: 'TradingView Indicator / Software',
        content_ids: ['cq-v6.1.12'],
        content_type: 'product',
        value: product.offerPriceNumber || 399,
        currency: product.currency || 'INR',
      });

      this.firedEvents.add('ViewContent');

      if (window.CONFLUENC_CONFIG?.tracking?.debug) {
        console.log('[Tracking] Fired ViewContent');
      }
    },

    trackInitiateCheckout: function (ctaLocation) {
      if (!this.initialized || !window.fbq) return;

      // Rate limit / deduplicate clicks within 2 seconds
      const now = Date.now();
      if (this.lastCtaClick && now - this.lastCtaClick < 2000) {
        return;
      }
      this.lastCtaClick = now;

      const product = window.CONFLUENC_CONFIG?.product || {};
      window.fbq('track', 'InitiateCheckout', {
        content_name: product.name || 'Confluenc Quant Indicator [v6.1.12]',
        content_category: 'TradingView Indicator / Software',
        content_ids: ['cq-v6.1.12'],
        num_items: 1,
        value: product.offerPriceNumber || 399,
        currency: product.currency || 'INR',
        cta_location: ctaLocation || 'unknown',
      });

      if (window.CONFLUENC_CONFIG?.tracking?.debug) {
        console.log(`[Tracking] Fired InitiateCheckout from: ${ctaLocation}`);
      }
    },

    bindCtaListeners: function () {
      document.addEventListener('click', (e) => {
        const ctaBtn = e.target.closest('[data-cta-checkout="true"]');
        if (ctaBtn) {
          const location = ctaBtn.getAttribute('data-cta-location') || 'unknown';
          this.trackInitiateCheckout(location);
        }
      });
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Tracking.init());
  } else {
    Tracking.init();
  }

  window.ConfluencTracking = Tracking;
})();
