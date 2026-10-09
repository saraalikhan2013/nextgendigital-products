/**
 * Confluenc Quant Indicator [v6.1.12]
 * Main Interactive Application Controller
 */

(function () {
  'use strict';

  var chartInstance = null;

  function bootstrap() {
    initProductData();
    initChart();
    initGallery();
    initFaqAccordion();
    initStickyMobileCta();
    initModals();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  /* --------------------------------------------------------------------------
     1. SYNC PRODUCT DATA FROM CONFIG
     -------------------------------------------------------------------------- */
  function initProductData() {
    const cfg = window.CONFLUENC_CONFIG;
    if (!cfg) return;

    // Apply checkout URL to all CTA buttons
    const ctaButtons = document.querySelectorAll('a[data-cta-checkout="true"]');
    ctaButtons.forEach(btn => {
      btn.href = cfg.checkout.url;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
    });
  }

  /* --------------------------------------------------------------------------
     2. INITIALIZE CHART SIMULATOR & CONTROLS
     -------------------------------------------------------------------------- */
  function initChart() {
    const canvas = document.getElementById('cq-candlestick-canvas');
    if (!canvas) return;

    chartInstance = new QuantChartEngine('cq-candlestick-canvas', {
      currentMarket: 'BTC/USDT',
      currentTimeframe: '15m'
    });

    // Market Symbol Select
    const symbolSelect = document.getElementById('cq-market-select');
    if (symbolSelect) {
      symbolSelect.addEventListener('change', (e) => {
        if (chartInstance) chartInstance.setMarket(e.target.value);
      });
    }

    // Timeframe Buttons
    const tfButtons = document.querySelectorAll('.chart-tf-btn');
    tfButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tfButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tf = btn.getAttribute('data-tf');
        if (chartInstance) chartInstance.setTimeframe(tf);
      });
    });

    // Layer Toggle Buttons
    const layerButtons = document.querySelectorAll('.layer-toggle-btn');
    layerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const layer = btn.getAttribute('data-layer');
        const isActive = btn.classList.contains('active');
        if (isActive) {
          btn.classList.remove('active');
          if (chartInstance) chartInstance.setLayer(layer, false);
        } else {
          btn.classList.add('active');
          if (chartInstance) chartInstance.setLayer(layer, true);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. SCREENSHOT & CHART GALLERY TABS
     -------------------------------------------------------------------------- */
  function initGallery() {
    const tabBtns = document.querySelectorAll('.gallery-tab-btn');
    const tabPanels = document.querySelectorAll('.gallery-view-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const activePanel = document.getElementById(targetId);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. FAQ ACCORDION (Interactive & Accessible)
     -------------------------------------------------------------------------- */
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close other items (clean single-open accordion)
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            other.querySelector('.faq-question-btn')?.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. STICKY MOBILE CTA BAR (Scroll-triggered)
     -------------------------------------------------------------------------- */
  function initStickyMobileCta() {
    const stickyBar = document.getElementById('sticky-mobile-cta');
    const heroSection = document.getElementById('hero');
    if (!stickyBar || !heroSection) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // If modal is active, do not force visible
          const hasOpenModal = document.querySelector('.modal-overlay.active');
          if (!entry.isIntersecting && !hasOpenModal) {
            stickyBar.classList.add('visible');
          } else {
            stickyBar.classList.remove('visible');
          }
        });
      }, { threshold: 0.1 });
      observer.observe(heroSection);
    } else {
      window.addEventListener('scroll', () => {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const hasOpenModal = document.querySelector('.modal-overlay.active');
        if (heroBottom < 100 && !hasOpenModal) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      }, { passive: true });
    }
  }

  /* --------------------------------------------------------------------------
     6. POLICY & LEGAL MODALS
     -------------------------------------------------------------------------- */
  function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const overlays = document.querySelectorAll('.modal-overlay');

    const stickyBar = document.getElementById('sticky-mobile-cta');

    modalTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-modal-target');
        const modal = document.getElementById(targetId);
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
          if (stickyBar) stickyBar.classList.remove('visible');
        }
      });
    });

    const closeModal = () => {
      overlays.forEach(overlay => overlay.classList.remove('active'));
      document.body.style.overflow = '';
      // Trigger small scroll check to restore sticky CTA if scrolled past hero
      const heroSection = document.getElementById('hero');
      if (stickyBar && heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        if (heroBottom < 100) stickyBar.classList.add('visible');
      }
    };

    overlays.forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.modal-close-btn')) {
          closeModal();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. SMOOTH SCROLLING FOR INTERNAL ANCHORS
     -------------------------------------------------------------------------- */
  function initSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

})();
