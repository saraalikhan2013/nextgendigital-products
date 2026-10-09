# Confluenc Quant Indicator [v6.1.12] — Premium Sales Landing Page

A high-converting, performance-optimized sales landing page for **Confluenc Quant Indicator [v6.1.12]** on TradingView.

## 🚀 Product Overview
- **Product Name**: Confluenc Quant Indicator [v6.1.12]
- **Regular Price**: ₹2,900
- **Current Offer**: ₹399 (One-Time Payment)
- **Checkout URL**: [https://superprofile.bio/vp/confluenc-quant-indicator--v6-1-12----smart-range---target-analysis-tool](https://superprofile.bio/vp/confluenc-quant-indicator--v6-1-12----smart-range---target-analysis-tool)

## ✨ Core Features
- **Smart Trend System**: Multi-EMA trend ribbon visualization
- **Automatic Support & Resistance**: Dynamic supply and demand price bands
- **VWAP & CPR Integration**: Volume-weighted average price and Central Pivot Range (TC, P, BC)
- **Interactive Chart Simulator**: High-DPI canvas candlestick chart engine with interactive timeframes, markets, and layer toggles
- **Smart Market HUD**: On-chart telemetry and real-time confluence score meter
- **Meta Ads Ready**: Meta Pixel event tracking (`PageView`, `ViewContent`, `InitiateCheckout`) with deduplication
- **Performance Optimized**: Sub-second load times, WebP next-gen images (-88% payload reduction), zero CLS layout stability, and edge caching

## 📁 Repository Structure
```text
├── index.html            # Main semantic HTML5 landing page with SEO & Schema.org markup
├── css/
│   ├── index.css         # Foundational design system, obsidian palette & lighting
│   ├── components.css    # Floating pill nav dock, buttons, glass cards, pricing & FAQs
│   ├── chart.css         # TradingView chart simulator UI and HUD dashboard styles
│   └── responsive.css    # Mobile-first breakpoints, sticky mobile CTA & safe-area insets
├── js/
│   ├── config.js         # Central product configuration (prices, URLs, features, pixel ID)
│   ├── chart-engine.js   # Interactive canvas candlestick engine with toggleable layers
│   ├── tracking.js       # Meta Pixel integration (PageView, ViewContent, InitiateCheckout)
│   └── app.js            # Gallery tabs, FAQ accordion, modals, and sticky bar logic
├── assets/               # WebP and fallback JPEG screenshots, SVG branding & favicon
├── .htaccess             # Apache / LiteSpeed Gzip compression & 1-year browser caching
├── vercel.json           # Vercel Edge CDN caching configuration
├── _headers              # Cloudflare Pages / Netlify static caching rules
└── README.md
```

## 🛠️ Deployment
This is a pure static web application with no build steps or backend required.
- **Vercel / Netlify / Cloudflare Pages**: Connect this GitHub repository for automatic deployment.
- **cPanel / Hostinger / Apache**: Upload all files to `public_html`. The included `.htaccess` automatically manages compression and caching.

## ⚙️ Meta Pixel Configuration
To connect your Meta Pixel, open `js/config.js` and set:
```javascript
tracking: {
  metaPixelId: "YOUR_META_PIXEL_ID",
  enabled: true,
  debug: false
}
```
