/**
 * Meta Pixel & Conversion Event Tracking
 * 100+ Premium Trading Resources Mega Bundle 2026
 * 
 * - New Pixel ID: 1779276967537882 (replaces old 4019058228397546)
 * - Recognizes existing Pixel base code in <head> to prevent duplicate initialization
 * - Standard PageView is fired once on initial page load (deduplicated)
 * - Fires custom 'DownloadClick' event when the DOWNLOAD ALL button is clicked
 * - DownloadClick fires BEFORE redirect to SuperProfile checkout
 * - NEVER fires 'Purchase' event (Purchase is handled by SuperProfile after payment)
 * - Enforces event deduplication to prevent double-click events
 * - Uses non-blocking listeners so navigation is never hindered if ad-blockers are active
 */

(function () {
  'use strict';

  var PIXEL_ID = '1779276967537882';

  var Tracking = {
    initialized: false,
    firedEvents: {},
    lastCtaClick: 0,

    init: function () {
      // 1. Check if Meta Pixel is already initialized (from the <head> snippet)
      if (typeof window.fbq === 'function') {
        this.initialized = true;
        // The <head> base code already fired PageView, mark it to prevent duplicate
        this.firedEvents['PageView'] = true;
      }

      // 2. Bind the DOWNLOAD ALL button click listener
      this.bindCtaListeners();
    },

    trackDownloadClick: function () {
      if (typeof window.fbq !== 'function') return;

      try {
        window.fbq('trackCustom', 'DownloadClick', {
          content_name: '100+ Premium Trading Resources Mega Bundle 2026',
          content_category: 'Trading Resources Bundle',
          cta_location: 'pricing-download-button'
        });
      } catch (err) {
        // Never let tracking errors interfere with user navigation
      }
    },

    bindCtaListeners: function () {
      document.addEventListener('click', function (e) {
        var ctaBtn = e.target.closest('[data-cta-checkout="true"], a[href*="superprofile.bio"]');
        if (!ctaBtn) return;

        // Rate limit / deduplicate clicks within 1.5 seconds
        var now = Date.now();
        if (Tracking.lastCtaClick && now - Tracking.lastCtaClick < 1500) {
          return;
        }
        Tracking.lastCtaClick = now;

        // Fire DownloadClick event BEFORE redirect
        Tracking.trackDownloadClick();

        // Give pixel events a brief window to transmit before navigation
        var href = ctaBtn.getAttribute('href');
        var opensNewTab = ctaBtn.target === '_blank';
        if (href && !opensNewTab) {
          e.preventDefault();
          setTimeout(function () {
            window.location.href = href;
          }, 200);
        }
      }, { passive: false });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { Tracking.init(); });
  } else {
    Tracking.init();
  }

  window.BundleTracking = Tracking;
})();
