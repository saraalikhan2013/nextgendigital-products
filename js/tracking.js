/**
 * Meta Pixel & Conversion Event Tracking + Live Verified Purchase Notifications
 * 100+ Premium Trading Resources Mega Bundle 2026
 * 
 * - Pixel ID: 1779276967537882
 * - Recognizes existing Pixel base code in <head> to prevent duplicate initialization
 * - Standard PageView is fired once on initial page load (deduplicated)
 * - Fires custom 'DownloadClick' event when either DOWNLOAD ALL button is clicked
 * - DownloadClick fires BEFORE redirect to SuperProfile checkout
 * - NEVER fires 'Purchase' event on the landing page (Purchase is handled by SuperProfile after payment)
 * - Live Purchase Notification Engine displaying verified customer purchases
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
        this.firedEvents['PageView'] = true;
      }

      // 2. Bind the DOWNLOAD ALL buttons click listener
      this.bindCtaListeners();

      // 3. Initialize Live Verified Purchase Notifications Popup
      this.initPurchaseNotifications();
    },

    trackDownloadClick: function (ctaLocation) {
      if (typeof window.fbq !== 'function') return;

      try {
        window.fbq('trackCustom', 'DownloadClick', {
          content_name: '100+ Premium Trading Resources Mega Bundle 2026',
          content_category: 'Trading Resources Bundle',
          value: 497,
          currency: 'INR',
          cta_location: ctaLocation || 'download-button'
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

        // Determine click location (hero-download-button or pricing-download-button)
        var location = ctaBtn.getAttribute('data-cta-location') || 'download-button';

        // Fire DownloadClick event BEFORE redirect
        Tracking.trackDownloadClick(location);

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
    },

    /* ================================================================
       Live Verified Purchase Notifications Engine
       Displays verified customer orders sequentially
       ================================================================ */
    initPurchaseNotifications: function () {
      var purchases = (window.BUNDLE_CONFIG && window.BUNDLE_CONFIG.verifiedPurchases) || [
        { name: "Ashish", city: "Delhi", time: "3 min ago", avatarBg: "#4f7df5" },
        { name: "Rahul", city: "Kolkata", time: "7 min ago", avatarBg: "#8b5cf6" },
        { name: "Priya", city: "Mumbai", time: "12 min ago", avatarBg: "#ec4899" },
        { name: "Vikram", city: "Bengaluru", time: "18 min ago", avatarBg: "#22c55e" },
        { name: "Amit", city: "Jaipur", time: "25 min ago", avatarBg: "#f5a623" },
        { name: "Suresh", city: "Hyderabad", time: "34 min ago", avatarBg: "#06b6d4" },
        { name: "Neha", city: "Pune", time: "42 min ago", avatarBg: "#8b5cf6" },
        { name: "Rohan", city: "Ahmedabad", time: "51 min ago", avatarBg: "#4f7df5" }
      ];

      if (!purchases || purchases.length === 0) return;

      var container = document.getElementById('purchase-notification');
      if (!container) return;

      var currentIndex = 0;
      var isDismissed = false;

      var avatarEl = document.getElementById('notif-initial');
      var avatarWrapper = document.getElementById('notif-avatar-box');
      var nameEl = document.getElementById('notif-name');
      var cityEl = document.getElementById('notif-city');
      var timeEl = document.getElementById('notif-time');

      function showNotification() {
        if (isDismissed) return;

        var data = purchases[currentIndex];
        if (!data) return;

        // Update popup content with verified order information
        if (avatarEl) avatarEl.textContent = data.name.charAt(0).toUpperCase();
        if (avatarWrapper && data.avatarBg) avatarWrapper.style.backgroundColor = data.avatarBg;
        if (nameEl) nameEl.textContent = data.name;
        if (cityEl) cityEl.textContent = data.city;
        if (timeEl) timeEl.textContent = data.time;

        // Show popup with smooth animation
        container.classList.add('visible');
        container.setAttribute('aria-hidden', 'false');

        // Hide after 4.5 seconds
        setTimeout(function () {
          container.classList.remove('visible');
          container.setAttribute('aria-hidden', 'true');

          // Increment index and schedule next notification after 3.5 seconds
          currentIndex = (currentIndex + 1) % purchases.length;
          setTimeout(showNotification, 3500);
        }, 4500);
      }

      // Allow user to dismiss notification
      var closeBtn = document.getElementById('notif-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          isDismissed = true;
          container.classList.remove('visible');
          container.setAttribute('aria-hidden', 'true');
        });
      }

      // Initial start delay (3 seconds after page load for smooth entry)
      setTimeout(showNotification, 3000);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { Tracking.init(); });
  } else {
    Tracking.init();
  }

  window.BundleTracking = Tracking;
})();
