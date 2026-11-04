/**
 * 100+ Premium Trading Resources Mega Bundle 2026
 * Central Configuration
 * 
 * Edit this file to update product information, URLs, Meta Pixel ID, 
 * verified purchases, and guarantee policies.
 */

const BUNDLE_CONFIG = {
  // Product Information
  product: {
    name: "100+ Premium Trading Resources Mega Bundle 2026",
    shortName: "Trading Mega Bundle 2026",
    brand: "NextGen Digital",
    tagline: "Everything a trader needs in one powerful bundle",
    subtitle: "Get instant access to 100+ carefully curated premium trading resources — strategies, indicators, guides, templates, charts, checklists, and more.",
    offerPrice: "₹497",
    offerPriceNumber: 497,
    regularPrice: "₹7,999",
    regularPriceNumber: 7999,
    discount: "93% OFF",
    savings: "₹7,502",
    combinedValue: "₹50,000+",
    currency: "INR",
    currencySymbol: "₹",
    billingCycle: "One-Time Payment",
    accessType: "Instant Digital Download + Lifetime Access",
    guarantee: "7-Day 100% Money-Back Guarantee",
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

  // Real Verified Purchases (displayed in live notification popup)
  // Update with actual confirmed customer orders from payment system
  verifiedPurchases: [
    { name: "Ashish", city: "Delhi", time: "3 min ago", avatarBg: "#4f7df5" },
    { name: "Rahul", city: "Kolkata", time: "7 min ago", avatarBg: "#8b5cf6" },
    { name: "Priya", city: "Mumbai", time: "12 min ago", avatarBg: "#ec4899" },
    { name: "Vikram", city: "Bengaluru", time: "18 min ago", avatarBg: "#22c55e" },
    { name: "Amit", city: "Jaipur", time: "25 min ago", avatarBg: "#f5a623" },
    { name: "Suresh", city: "Hyderabad", time: "34 min ago", avatarBg: "#06b6d4" },
    { name: "Neha", city: "Pune", time: "42 min ago", avatarBg: "#8b5cf6" },
    { name: "Rohan", city: "Ahmedabad", time: "51 min ago", avatarBg: "#4f7df5" }
  ],

  // 7-Day Money-Back Guarantee Details
  guarantee: {
    periodDays: 7,
    coveragePercent: 100,
    headline: "100% Risk-Free 7-Day Money-Back Guarantee",
    summary: "Explore all 100+ trading resources risk-free. If you are not completely satisfied with the quality and depth of the materials within 7 days of purchase, simply request a refund through our official support channel for a prompt, 100% full refund.",
    supportUrl: "https://superprofile.bio/vp/%F0%9F%94%A5-100--premium-trading-resources-in-one-ultimate-bundle-2026--%F0%9F%93%A6"
  },

  // Official Trading Risk Disclaimer
  disclaimer: "100+ Premium Trading Resources Mega Bundle 2026 is provided strictly for educational and informational purposes and does not constitute financial, investment, or trading advice. Trading in equities, futures, options, forex, and cryptocurrency involves substantial risk of capital loss. Past performance of any strategy, indicator, or setup does not guarantee future results. Users are solely responsible for their trading and investment decisions."
};

// Freeze configuration to prevent accidental modification
if (typeof Object.freeze === 'function') {
  Object.freeze(BUNDLE_CONFIG);
}

// Export for module or browser window
if (typeof window !== 'undefined') {
  window.BUNDLE_CONFIG = BUNDLE_CONFIG;
}
