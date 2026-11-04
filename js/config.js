/**
 * 100+ Premium Trading Resources Mega Bundle 2026
 * Central Configuration
 * 
 * Edit this file to update product information, URLs, and Meta Pixel ID.
 */

const BUNDLE_CONFIG = {
  // Product Information
  product: {
    name: "100+ Premium Trading Resources Mega Bundle 2026",
    shortName: "Trading Mega Bundle 2026",
    tagline: "Everything a trader needs in one powerful bundle",
    subtitle: "Get instant access to 100+ carefully curated premium trading resources — strategies, guides, templates, charts, checklists, and more.",
    currency: "INR",
    currencySymbol: "₹",
    billingCycle: "One-Time Payment",
    accessType: "Instant Digital Download",
  },

  // Primary Checkout Destination
  checkout: {
    url: "https://superprofile.bio/vp/%F0%9F%94%A5-100--premium-trading-resources-in-one-ultimate-bundle-2026--%F0%9F%93%A6",
    provider: "SuperProfile",
    buttonText: "DOWNLOAD ALL",
    subtext: "Continue to the SuperProfile checkout page to complete your purchase.",
  },

  // Meta Pixel Configuration
  tracking: {
    metaPixelId: "1779276967537882",
    enabled: true,
    debug: false,
  },

  // Bundle Contents Categories
  bundleContents: [
    {
      title: "Trading Strategies",
      description: "Proven trading strategies covering intraday, swing trading, positional, and multiple market approaches.",
      icon: "chart"
    },
    {
      title: "Technical Analysis Resources",
      description: "Chart patterns, candlestick analysis guides, indicator setups, and technical analysis reference materials.",
      icon: "analysis"
    },
    {
      title: "Trading Plans & Templates",
      description: "Ready-to-use trading plan templates, journal formats, risk management calculators, and position sizing tools.",
      icon: "template"
    },
    {
      title: "Market Analysis Guides",
      description: "In-depth guides for analyzing stocks, forex, crypto, commodities, and indices.",
      icon: "guide"
    },
    {
      title: "Trading Checklists & SOPs",
      description: "Pre-trade, during-trade, and post-trade checklists along with standard operating procedures.",
      icon: "checklist"
    },
    {
      title: "Tools & Setup Guides",
      description: "Platform setup guides, charting workspace configurations, watchlist templates, and trading tool recommendations.",
      icon: "tools"
    }
  ],

  // Official Disclaimer
  disclaimer: "The trading resources in this bundle are provided for educational and informational purposes only and do not constitute financial or investment advice. Trading involves risk, and past performance does not guarantee future results. Users are responsible for their own trading decisions."
};

// Freeze configuration to prevent accidental modification
if (typeof Object.freeze === 'function') {
  Object.freeze(BUNDLE_CONFIG);
}

// Export for module or browser window
if (typeof window !== 'undefined') {
  window.BUNDLE_CONFIG = BUNDLE_CONFIG;
}
