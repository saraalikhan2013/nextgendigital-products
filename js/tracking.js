/**
 * Meta Pixel & Conversion Event Tracking
 * Confluenc Quant Indicator [v6.1.12]
 * 
 * Supports Meta Pixel tracking cleanly and safely:
 * - Reads Pixel ID from window.CONFLUENC_CONFIG.tracking.metaPixelId (4019058228397546)
 * - Recognizes existing Pixel base code in <head> to prevent duplicate initialization
 * - Standard PageView is fired once on initial page load (deduplicated)
 * - Fires standard 'InitiateCheckout' when any purchase CTA button is clicked
 * - Enforces event deduplication to prevent accidental double-click events
 * - Uses non-blocking listeners so navigation is never hindered if ad-blockers are active
 * - NEVER fires 'Purchase' event on CTA click (Purchase is handled exclusively by Superprofile after payment)
 */

(function () {
  'use strict';

  const Tracking = {
    initialized: false,
    firedEvents: new Set(),
    lastCtaClick: 0,

    init: function () {
      const config = window.CONFLUENC_CONFIG?.tracking || {};
      const pixelId = (config.metaPixelId || window.META_PIXEL_ID || '4019058228397546').trim();
      const isPlaceholder = !pixelId || pixelId.includes('YOUR_META_PIXEL_ID') || !/^\d+$/.test(pixelId);

      // 1. Check if Meta Pixel is already initialized (e.g. from the official <head> snippet)
      if (typeof window.fbq === 'function') {
        this.initialized = true;
        // The <head> base code already fired PageView, mark it to prevent duplicate fire
        this.firedEvents.add('PageView');
        if (config.debug) {
          console.log(`[Tracking] Meta Pixel detected in document head (ID: ${pixelId}). Duplicate initialization prevented.`);
        }
      } else if (config.enabled && !isPlaceholder) {
        // Fallback: Inject Pixel if not already present in HTML
        this.injectMetaPixel(pixelId);
        this.trackPageView();
      }

      // 2. Bind checkout button click listeners
      this.bindCtaListeners();
    },

    injectMetaPixel: function (pixelId) {
      if (typeof window.fbq === 'function') {
        this.initialized = true;
        return;
      }

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
      if (typeof window.fbq !== 'function') return;
      if (this.firedEvents.has('PageView')) return;

      try {
        window.fbq('track', 'PageView');
        this.firedEvents.add('PageView');

        if (window.CONFLUENC_CONFIG?.tracking?.debug) {
          console.log('[Tracking] Fired PageView');
        }
      } catch (err) {
        // Ignore tracking errors if script is blocked
      }
    },

    trackDownloadClick: function () {
      if (typeof window.fbq !== 'function') return;

      try {
        window.fbq('trackCustom', 'DownloadClick');

        if (window.CONFLUENC_CONFIG?.tracking?.debug) {
          console.log('[Tracking] Fired DownloadClick');
        }
      } catch (err) {
        // Never let tracking errors interfere with user navigation
      }
    },

    trackInitiateCheckout: function (ctaLocation) {
      if (typeof window.fbq !== 'function') return;

      try {
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
      } catch (err) {
        // Never let tracking errors interfere with user navigation
      }
    },

    bindCtaListeners: function () {
      document.addEventListener('click', (e) => {
        const ctaBtn = e.target.closest('[data-cta-checkout="true"], a[href*="superprofile.bio"]');
        if (!ctaBtn) return;

        // Rate limit / deduplicate clicks within 1.5 seconds
        const now = Date.now();
        if (this.lastCtaClick && now - this.lastCtaClick < 1500) {
          return;
        }
        this.lastCtaClick = now;

        // Fire both DownloadClick and InitiateCheckout events
        const location = ctaBtn.getAttribute('data-cta-location') || 'checkout-button';
        this.trackDownloadClick();
        this.trackInitiateCheckout(location);

        // Give pixel events a brief window to transmit before navigation.
        // Only intercept if the link navigates the current tab (not target="_blank").
        const href = ctaBtn.getAttribute('href');
        const opensNewTab = ctaBtn.target === '_blank';
        if (href && !opensNewTab) {
          e.preventDefault();
          setTimeout(function () {
            window.location.href = href;
          }, 150);
        }
        // If target="_blank", the browser opens a new tab and the current page
        // stays alive — pixel events transmit without any delay needed.
      }, { passive: false });
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Tracking.init());
  } else {
    Tracking.init();
  }

  window.ConfluencTracking = Tracking;
})();
