/**
 * Confluenc Quant Indicator [v6.1.12]
 * Central Configuration
 * 
 * Edit this file to update product pricing, URLs, Meta Pixel ID, features, and inclusions.
 */

const CONFLUENC_CONFIG = {
  // Product Information
  product: {
    name: "Confluenc Quant Indicator [v6.1.12]",
    shortName: "Confluenc Quant v6.1.12",
    tagline: "Bring Clarity to Your Technical Analysis",
    subtitle: "Explore trend analysis, support and resistance, VWAP, CPR, market dashboards, and other technical analysis tools in one organized TradingView indicator.",
    regularPrice: "₹2,900",
    regularPriceNumber: 2900,
    offerPrice: "₹399",
    offerPriceNumber: 399,
    currency: "INR",
    currencySymbol: "₹",
    billingCycle: "One-Time Payment",
    accessType: "Private TradingView Invite",
    platform: "TradingView (Compatible with Free & Paid accounts)",
    version: "v6.1.12",
  },

  // Primary Checkout Destination
  checkout: {
    url: "https://superprofile.bio/vp/confluenc-quant-indicator--v6-1-12----smart-range---target-analysis-tool",
    provider: "Superprofile",
    buttonTextPrimary: "GET CONFLUENC QUANT — ₹399",
    buttonTextPricing: "GET INSTANT ACCESS — ₹399",
    buttonTextSticky: "GET ACCESS — ₹399",
    subtext: "Continue to the Superprofile checkout page to complete your purchase.",
    finalSubtext: "Continue to checkout on Superprofile.",
  },

  // Meta Pixel Configuration
  // Paste your Meta Pixel ID here (e.g. '123456789012345') when deploying
  tracking: {
    metaPixelId: "", // Leave blank or add your real Meta Pixel ID
    enabled: false,  // Set to true when metaPixelId is provided
    debug: false,    // Set to true to see console logs for tracking events
  },

  // Hero Key Benefits
  heroBenefits: [
    { text: "Multiple Technical Analysis Tools", icon: "layers" },
    { text: "Structured Chart Analysis", icon: "activity" },
    { text: "Customizable TradingView Alerts", icon: "bell" },
  ],

  // 4 Core Benefit Cards
  coreBenefits: [
    {
      id: "chart-analysis",
      title: "Simplified Chart Analysis",
      description: "Bring multiple technical analysis tools together in one organized interface.",
      icon: "layout",
      accent: "green"
    },
    {
      id: "trend-analysis",
      title: "Structured Trend Analysis",
      description: "Review trend direction and EMA-based visualizations as part of your analysis process.",
      icon: "trending-up",
      accent: "cyan"
    },
    {
      id: "technical-levels",
      title: "More Organized Technical Levels",
      description: "Review support and resistance, trendlines, VWAP, and CPR information without repeatedly switching between separate tools.",
      icon: "sliders",
      accent: "emerald"
    },
    {
      id: "market-alerts",
      title: "Configurable Market Alerts",
      description: "Use available TradingView alert functionality to follow relevant market conditions.",
      icon: "bell-ring",
      accent: "mint"
    }
  ],

  // 13 Full Product Features
  features: [
    {
      id: "feat-trend",
      title: "Smart Trend System",
      description: "Multi-EMA-based trend visualization to help users review trend direction.",
      category: "Trend & Direction",
      tag: "Core"
    },
    {
      id: "feat-trendlines",
      title: "Automatic Trendlines",
      description: "Automatically displayed trendlines for technical chart analysis.",
      category: "Technical Levels",
      tag: "Dynamic"
    },
    {
      id: "feat-dashboard",
      title: "Smart Market Dashboard",
      description: "An organized view of relevant market conditions.",
      category: "Market Context",
      tag: "HUD Overlay"
    },
    {
      id: "feat-sr",
      title: "Automatic Support & Resistance",
      description: "Visual support and resistance levels for reviewing important price zones.",
      category: "Technical Levels",
      tag: "Auto-Calculated"
    },
    {
      id: "feat-vwap",
      title: "VWAP Integration",
      description: "Volume Weighted Average Price visualization for market context.",
      category: "Volume & Price",
      tag: "Institutional"
    },
    {
      id: "feat-cpr",
      title: "CPR Professional",
      description: "Pivot calculations for examining potentially relevant market levels.",
      category: "Pivot Framework",
      tag: "TC / P / BC"
    },
    {
      id: "feat-entry-finder",
      title: "Entry Zone Finder",
      description: "A visual tool for reviewing potential technical entry zones.",
      category: "Setup Review",
      tag: "Visual Box"
    },
    {
      id: "feat-signals",
      title: "Smart Buy/Sell Signals",
      description: "Technical signals designed to help users review potential setups. Clearly communicate that signals do not guarantee successful trades.",
      category: "Signal Aids",
      tag: "Decision Aid"
    },
    {
      id: "feat-market-structure",
      title: "Market Structure Analysis",
      description: "Visual elements that help users review market structure.",
      category: "Structure",
      tag: "Highs & Lows"
    },
    {
      id: "feat-alerts",
      title: "Up to 40 Smart Alerts",
      description: "Advertised alert functionality, subject to the actual indicator configuration and TradingView platform restrictions.",
      category: "Notifications",
      tag: "Alert Triggers"
    },
    {
      id: "feat-mtf",
      title: "Multi-Timeframe Analysis",
      description: "Support for multiple compatible TradingView timeframes.",
      category: "Timeframes",
      tag: "1m to 1D+"
    },
    {
      id: "feat-markets",
      title: "Multi-Market Compatibility",
      description: "Designed for supported TradingView charts, including stocks, forex, cryptocurrencies, indices, commodities, gold, and options where compatible.",
      category: "Assets",
      tag: "Cross-Market"
    },
    {
      id: "feat-devices",
      title: "Multi-Device Support",
      description: "Designed for compatible desktop, laptop, tablet, and mobile environments.",
      category: "Platforms",
      tag: "Universal"
    }
  ],

  // What's Included in the Offer
  inclusions: [
    {
      title: "Confluenc Quant Indicator [v6.1.12]",
      description: "The complete proprietary PineScript indicator ready to add directly to your TradingView account.",
      icon: "check-circle",
      badge: "Core Software"
    },
    {
      title: "Private TradingView Invite Access",
      description: "Direct invite-only access tied to your TradingView username with lifetime permission.",
      icon: "shield",
      badge: "Invite-Only"
    },
    {
      title: "Premium 40 Alert Version",
      description: "Pre-configured smart alert triggers for trend shifts, support/resistance tests, and signals.",
      icon: "bell",
      badge: "40 Alert Hooks"
    },
    {
      title: "Beginner-Friendly Setup Guide (PDF)",
      description: "Step-by-step visual documentation explaining how to load, configure, and customize the indicator.",
      icon: "file-text",
      badge: "PDF Guide"
    },
    {
      title: "Installation Support",
      description: "Dedicated assistance to make sure your indicator is activated and running smoothly.",
      icon: "life-buoy",
      badge: "Direct Support"
    },
    {
      title: "Lifetime Updates",
      description: "Receive all future algorithmic refinements, optimizations, and TradingView compatibility patches.",
      icon: "refresh-cw",
      badge: "Free Updates"
    },
    {
      title: "Private WhatsApp Community",
      description: "Join fellow traders for indicator usage discussions, workflow sharing, and charting insights.",
      icon: "message-circle",
      badge: "Trader Network"
    }
  ],

  // How It Works Steps
  howItWorks: [
    {
      step: "01",
      title: "Purchase Access",
      description: "Click the purchase button to continue to the official Superprofile checkout page and complete your ₹399 payment.",
      icon: "shopping-bag"
    },
    {
      step: "02",
      title: "Receive Indicator Access",
      description: "After payment confirmation, follow the product access instructions provided with your purchase and submit your TradingView username.",
      icon: "key"
    },
    {
      step: "03",
      title: "Set Up Your Indicator",
      description: "Use the included setup guide and available installation support to configure the indicator under 'Invite-Only Scripts' on TradingView.",
      icon: "monitor"
    }
  ],

  // Market & Device Compatibility
  compatibility: {
    markets: [
      { name: "Stocks", desc: "NSE, BSE, US Equities & Global Equities", icon: "trending-up" },
      { name: "Indices", desc: "NIFTY 50, BANKNIFTY, S&P 500, NASDAQ", icon: "bar-chart-2" },
      { name: "Forex", desc: "EUR/USD, GBP/USD, USD/JPY & Major Pairs", icon: "dollar-sign" },
      { name: "Crypto", desc: "BTC/USDT, ETH/USDT & Liquid Altcoins", icon: "cpu" },
      { name: "Commodities", desc: "Crude Oil, Natural Gas & Energy", icon: "activity" },
      { name: "Gold & Silver", desc: "XAU/USD, MCX Gold & Precious Metals", icon: "shield" },
      { name: "Options", desc: "Index & Stock Options charts where supported", icon: "layers" }
    ],
    devices: [
      { name: "Desktop", desc: "Windows, macOS, Linux workstations", icon: "monitor" },
      { name: "Laptop", desc: "MacBook, ThinkPad, Dell, ultrabooks", icon: "laptop" },
      { name: "Tablet", desc: "iPad, Android tablets, touch displays", icon: "tablet" },
      { name: "Mobile", desc: "TradingView app on iOS & Android smartphones", icon: "smartphone" }
    ]
  },

  // 12 FAQs
  faqs: [
    {
      question: "What is Confluenc Quant Indicator [v6.1.12]?",
      answer: "Confluenc Quant Indicator [v6.1.12] is an all-in-one technical analysis indicator developed for TradingView. It synthesizes multiple technical tools—such as multi-EMA trend bands, automatic support and resistance zones, VWAP, Central Pivot Range (CPR), market structure markers, and an on-chart HUD dashboard—into a single structured script to simplify your charting workflow."
    },
    {
      question: "What is the price of the indicator?",
      answer: "The indicator is currently offered at a special price of ₹399 (regular price is ₹2,900) as a one-time purchase with no recurring monthly subscriptions."
    },
    {
      question: "What features does it include?",
      answer: "It includes the Smart Trend System (Multi-EMA), Automatic Trendlines, Smart Market Dashboard, Automatic Support & Resistance, VWAP Integration, CPR Professional (Pivot calculations), Entry Zone Finder, Smart Buy/Sell Signals, Market Structure Analysis, and support for up to 40 TradingView alerts."
    },
    {
      question: "Does it support multiple timeframes?",
      answer: "Yes. Confluenc Quant works across all standard TradingView timeframes including intraday intervals (1m, 3m, 5m, 15m), swing timeframes (1h, 4h), and higher timeframes (Daily, Weekly)."
    },
    {
      question: "Which markets can I analyze with it?",
      answer: "It works on any market available on TradingView, including Indian equities & indices (NIFTY, BANKNIFTY), US & global stocks, Forex pairs, Cryptocurrencies, Commodities (Crude Oil, Gold, Silver), and supported Options charts."
    },
    {
      question: "Does it provide Buy/Sell signals?",
      answer: "Yes, it displays technical Buy/Sell signal markers designed to assist traders in reviewing potential trade setups. Please note that signals are algorithmic visual aids and do not guarantee successful trades or profits."
    },
    {
      question: "Can beginners use the indicator?",
      answer: "Absolutely. The indicator comes with a clear, step-by-step setup guide (PDF) that walks you through adding it to TradingView and understanding each visual layer. In addition, dedicated installation support is available if you need help."
    },
    {
      question: "Does it include VWAP and CPR?",
      answer: "Yes, both Volume Weighted Average Price (VWAP) and Central Pivot Range (CPR Professional with TC, Pivot, and BC levels) are directly integrated into the indicator, saving you from adding multiple separate scripts."
    },
    {
      question: "How do I receive access after purchasing?",
      answer: "After completing your ₹399 purchase on the official Superprofile checkout page, you will receive immediate confirmation along with setup instructions. You will submit your TradingView username, and private invite-only script access will be granted directly to your TradingView account."
    },
    {
      question: "Does it work with a free TradingView account?",
      answer: "Yes. It functions seamlessly on free TradingView accounts as well as Essential, Plus, and Premium tiers. Because it combines multiple indicators into one single script, it helps free-tier users maximize TradingView's indicator limit."
    },
    {
      question: "Are lifetime updates and installation support included?",
      answer: "Yes. Your one-time payment includes lifetime access to future updates of the indicator script as well as installation support to ensure your indicator is properly configured."
    },
    {
      question: "Does the indicator guarantee profitable trades?",
      answer: "No indicator can guarantee profits. Confluenc Quant [v6.1.12] is an advanced technical analysis tool built to help traders analyze chart structure, key price levels, and market momentum more systematically. All trading carries inherent risk, and users are solely responsible for their trading decisions."
    }
  ],

  // Official Risk Disclaimer
  disclaimer: "Confluenc Quant Indicator [v6.1.12] is provided for educational and informational purposes only and does not constitute financial or investment advice. It does not guarantee profitable trades, signal accuracy, or financial returns. Trading involves risk, and past performance does not guarantee future results. Users are responsible for their own trading decisions and should conduct independent research."
};

// Freeze configuration to prevent accidental modification
if (typeof Object.freeze === 'function') {
  Object.freeze(CONFLUENC_CONFIG);
}

// Export for module or browser window
if (typeof window !== 'undefined') {
  window.CONFLUENC_CONFIG = CONFLUENC_CONFIG;
}
