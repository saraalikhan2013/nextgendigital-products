/**
 * Interactive TradingView Candlestick Chart Engine
 * Confluenc Quant Indicator [v6.1.12]
 * 
 * Features:
 * - High-DPI Canvas Rendering with DPR auto-scaling
 * - Realistic Japanese Candlesticks with Wicks & Dynamic Sizing
 * - Multi-EMA Ribbon (Dynamic trend smoothing: 9, 21, 50)
 * - Automatic Support & Resistance Price Zones
 * - Cumulative VWAP (Volume Weighted Average Price) Curve
 * - CPR (Central Pivot Range: TC, P, BC)
 * - Algorithmic Buy/Sell Signal Callout Markers (Corrected position mapping)
 * - Volume Histogram
 * - Interactive Crosshair with Price/Time labels (Touch & Mouse)
 * - Dynamic HUD Sync & Indicator Layer Toggles
 */

class QuantChartEngine {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.container = this.canvas.parentElement;

    this.options = Object.assign({
      theme: 'dark',
      showEma: true,
      showVwap: true,
      showCpr: true,
      showSr: true,
      showSignals: true,
      showVolume: true,
      currentMarket: 'BTC/USDT',
      currentTimeframe: '15m'
    }, options);

    this.symbol = this.options.currentMarket;
    this.timeframe = this.options.currentTimeframe;

    this.candles = [];
    this.signals = [];
    this.srLevels = [];
    this.cpr = {};
    this.crosshair = { active: false, x: 0, y: 0, candle: null };

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.generateMarketData(this.symbol, this.timeframe);
    this.setupResizeListener();
    this.setupInteractivity();
    this.render();
    this.resetHudInfo();
  }

  setupResizeListener() {
    this.resizePending = false;
    const handleResize = () => {
      if (this.resizePending) return;
      this.resizePending = true;
      requestAnimationFrame(() => {
        this.resizePending = false;
        const prevWidth = this.width;
        this.resizeCanvas();
        // If container width changed meaningfully (orientation change or device resize), regenerate appropriate candle count
        if (Math.abs((this.width || 0) - (prevWidth || 0)) > 30) {
          const sym = this.symbol || this.options.currentMarket || 'BTC/USDT';
          const tf = this.timeframe || this.options.currentTimeframe || '15m';
          this.generateMarketData(sym, tf);
        }
        this.render();
      });
    };

    if (window.ResizeObserver && this.container) {
      this.resizeObserver = new ResizeObserver(handleResize);
      this.resizeObserver.observe(this.container);
    }
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
  }

  resizeCanvas() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.width = rect.width || (this.container.clientWidth || 360);
    this.height = rect.height || (window.innerWidth < 640 ? 350 : 440);

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  requestRender() {
    if (this.renderPending) return;
    this.renderPending = true;
    requestAnimationFrame(() => {
      this.renderPending = false;
      this.render();
    });
  }

  generateMarketData(symbol, tf) {
    let basePrice = 67250;
    let volatility = 105;
    let decimals = 2;

    if (symbol.includes('NIFTY')) {
      basePrice = 24850;
      volatility = 42;
    } else if (symbol.includes('BANKNIFTY')) {
      basePrice = 51400;
      volatility = 95;
    } else if (symbol.includes('EUR')) {
      basePrice = 1.0850;
      volatility = 0.0014;
      decimals = 4;
    } else if (symbol.includes('GOLD')) {
      basePrice = 2650;
      volatility = 8.5;
    }

    this.symbol = symbol;
    this.timeframe = tf;
    this.decimals = decimals;

    // Responsive candle density: fewer candles on narrow mobile screens for maximum readability
    const width = this.width || 360;
    let count = 46;
    if (width < 450) {
      count = 32;
    } else if (width < 768) {
      count = 38;
    } else if (width < 1100) {
      count = 46;
    } else {
      count = 54;
    }

    this.candles = [];
    const now = Date.now();
    const intervalMs = tf === '1m' ? 60000 : tf === '5m' ? 300000 : tf === '15m' ? 900000 : tf === '1h' ? 3600000 : 86400000;

    // Define key structural wave pivot points
    // Position 1: earlier swing high resistance test (SELL signal position)
    const sellIdx = Math.round(count * 0.40);
    // Position 2: confluence support bounce launchpad (BUY signal position)
    const buyIdx = Math.round(count * 0.62);

    let current = basePrice;

    for (let i = 0; i < count; i++) {
      const time = now - (count - i) * intervalMs;
      let target;

      if (i <= sellIdx) {
        // Wave 1: Initial upward swing to local resistance
        const progress = i / (sellIdx || 1);
        target = basePrice + progress * volatility * 2.2;
      } else if (i <= buyIdx) {
        // Wave 2: Orderly pullback to dynamic support / CPR range
        const progress = (i - sellIdx) / (buyIdx - sellIdx || 1);
        target = (basePrice + volatility * 2.2) - progress * volatility * 2.3;
      } else {
        // Wave 3: Strong expansion bull run breaking to new highs
        const progress = (i - buyIdx) / (count - 1 - buyIdx || 1);
        target = (basePrice + volatility * 0.3) + Math.pow(progress, 0.82) * volatility * 8.6;
      }

      const noise = (Math.random() - 0.45) * volatility * 0.32;
      let openP = current;
      let closeP = target + noise;

      // Ensure the candle at buyIdx forms a definitive bullish reversal bounce
      if (i === buyIdx) {
        openP = target - volatility * 0.35;
        closeP = target + volatility * 0.45;
      }

      // Ensure the candle at sellIdx forms an upper rejection wick
      if (i === sellIdx) {
        closeP = openP - volatility * 0.2;
      }

      const highP = Math.max(openP, closeP) + Math.random() * volatility * (i === sellIdx ? 0.75 : 0.45);
      const lowP = Math.min(openP, closeP) - Math.random() * volatility * (i === buyIdx ? 0.65 : 0.4);

      // Volume surge on breakout & expansion
      let volume = Math.floor(Math.random() * 500 + 400);
      if (i >= buyIdx) {
        volume = Math.floor(800 + (i - buyIdx) * 120 + Math.random() * 600);
      } else if (i === sellIdx) {
        volume = Math.floor(950 + Math.random() * 400);
      }

      this.candles.push({
        time,
        open: openP,
        high: highP,
        low: lowP,
        close: closeP,
        volume
      });

      current = closeP;
    }

    // Calculate indicator overlays and signal positions
    this.calculateIndicators(sellIdx, buyIdx);
  }

  calculateIndicators(sellIdx, buyIdx) {
    const closes = this.candles.map(c => c.close);
    
    // EMA calculations
    const ema9 = this.calcEMA(closes, 9);
    const ema21 = this.calcEMA(closes, 21);
    const ema50 = this.calcEMA(closes, 50);

    // Cumulative VWAP
    let cumVol = 0;
    let cumVolPrice = 0;
    const vwap = [];

    this.candles.forEach((c, idx) => {
      const typical = (c.high + c.low + c.close) / 3;
      cumVol += c.volume;
      cumVolPrice += typical * c.volume;
      vwap.push(cumVolPrice / (cumVol || 1));
      
      c.ema9 = ema9[idx];
      c.ema21 = ema21[idx];
      c.ema50 = ema50[idx];
      c.vwap = vwap[idx];
    });

    // CPR Pivot Levels (Pivot = (H+L+C)/3, BC = (H+L)/2, TC = (Pivot - BC) + Pivot)
    const len = this.candles.length;
    const sampleLen = Math.min(18, len);
    const recentHigh = Math.max(...this.candles.slice(0, sampleLen).map(c => c.high));
    const recentLow = Math.min(...this.candles.slice(0, sampleLen).map(c => c.low));
    const recentClose = this.candles[sampleLen - 1].close;

    const pivot = (recentHigh + recentLow + recentClose) / 3;
    const bc = (recentHigh + recentLow) / 2;
    const tc = (pivot - bc) + pivot;

    this.cpr = {
      tc: Math.max(tc, bc),
      p: pivot,
      bc: Math.min(tc, bc),
      r1: (2 * pivot) - recentLow,
      s1: (2 * pivot) - recentHigh,
      r2: pivot + (recentHigh - recentLow),
      s2: pivot - (recentHigh - recentLow)
    };

    // Support and Resistance Zones
    this.srLevels = [
      { type: 'resistance', price: this.cpr.r1, label: 'Res 1 (Dynamic)' },
      { type: 'support', price: this.cpr.s1, label: 'Sup 1 (Dynamic)' }
    ];

    // Algorithmic Buy/Sell Signals:
    // Position 1 (earlier swing high, where BUY was incorrectly shown): SWAPPED TO SELL ▼
    // Position 2 (confluence breakout, where SELL was incorrectly shown): SWAPPED TO BUY ▲
    this.signals = [
      {
        index: sellIdx,
        type: 'sell',
        price: this.candles[sellIdx].high,
        text: 'SELL ▼'
      },
      {
        index: buyIdx,
        type: 'buy',
        price: this.candles[buyIdx].low,
        text: 'BUY ▲'
      }
    ];
  }

  calcEMA(data, period) {
    if (!data.length) return [];
    const k = 2 / (period + 1);
    const emaArray = [data[0]];
    for (let i = 1; i < data.length; i++) {
      emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
    }
    return emaArray;
  }

  setupInteractivity() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleMove = (e) => {
      const pos = getPos(e);
      this.crosshair.active = true;
      this.crosshair.x = pos.x;
      this.crosshair.y = pos.y;
      this.updateCrosshairCandle(pos.x);
      this.requestRender();
    };

    const handleEnd = () => {
      this.crosshair.active = false;
      this.requestRender();
      this.resetHudInfo();
    };

    this.canvas.addEventListener('mousemove', handleMove, { passive: true });
    this.canvas.addEventListener('mouseleave', handleEnd, { passive: true });
    this.canvas.addEventListener('touchstart', handleMove, { passive: true });
    this.canvas.addEventListener('touchmove', handleMove, { passive: true });
    this.canvas.addEventListener('touchend', handleEnd, { passive: true });
  }

  updateCrosshairCandle(x) {
    if (!this.plotArea || !this.candles.length) return;
    const { left, width } = this.plotArea;
    if (x < left || x > left + width) return;

    const candleWidth = width / this.candles.length;
    const index = Math.floor((x - left) / candleWidth);
    if (index >= 0 && index < this.candles.length) {
      const c = this.candles[index];
      this.crosshair.candle = c;
      this.updateHudInfo(c);
    }
  }

  updateHudInfo(candle) {
    if (!candle) return;
    const hudPrice = document.getElementById('cq-hud-price');
    const hudChange = document.getElementById('cq-hud-change');
    const hudOhlc = document.getElementById('cq-hud-ohlc');

    if (hudPrice) {
      hudPrice.textContent = candle.close.toFixed(this.decimals);
      const isUp = candle.close >= candle.open;
      hudPrice.className = `hud-val ${isUp ? 'text-neon' : 'text-red'}`;
    }

    if (hudChange) {
      const diff = candle.close - candle.open;
      const pct = (diff / (candle.open || 1)) * 100;
      hudChange.textContent = `${diff >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
      hudChange.className = `hud-badge ${diff >= 0 ? 'badge-green' : 'badge-red'}`;
    }

    if (hudOhlc) {
      hudOhlc.innerHTML = `<span>O: ${candle.open.toFixed(this.decimals)}</span> <span>H: ${candle.high.toFixed(this.decimals)}</span> <span>L: ${candle.low.toFixed(this.decimals)}</span> <span>C: ${candle.close.toFixed(this.decimals)}</span>`;
    }
  }

  resetHudInfo() {
    if (this.candles.length > 0) {
      const latest = this.candles[this.candles.length - 1];
      this.updateHudInfo(latest);
    }
  }

  setLayer(layer, state) {
    if (layer === 'ema') this.options.showEma = state;
    if (layer === 'vwap') this.options.showVwap = state;
    if (layer === 'cpr') this.options.showCpr = state;
    if (layer === 'sr') this.options.showSr = state;
    if (layer === 'signals') this.options.showSignals = state;
    this.requestRender();
  }

  setMarket(symbol) {
    this.options.currentMarket = symbol;
    this.symbol = symbol;
    this.generateMarketData(symbol, this.options.currentTimeframe);
    this.requestRender();
    this.resetHudInfo();
  }

  setTimeframe(tf) {
    this.options.currentTimeframe = tf;
    this.timeframe = tf;
    this.generateMarketData(this.options.currentMarket, tf);
    this.requestRender();
    this.resetHudInfo();
  }

  roundRect(ctx, x, y, w, h, r = 4) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Background fill
    ctx.fillStyle = '#080D0A';
    ctx.fillRect(0, 0, w, h);

    // Responsive margins tailored to mobile and desktop
    const isMobile = w < 500;
    const marginTop = isMobile ? 18 : 26;
    const marginBottom = isMobile ? 32 : 44;
    const marginLeft = isMobile ? 8 : 16;
    const marginRight = isMobile ? 54 : 68;

    const plotW = Math.max(100, w - marginLeft - marginRight);
    const plotH = Math.max(100, h - marginTop - marginBottom);
    const volumeH = plotH * 0.20;
    const candleAreaH = plotH - volumeH;

    this.plotArea = { left: marginLeft, top: marginTop, width: plotW, height: candleAreaH };

    if (!this.candles.length) return;

    // Find min and max price with balanced vertical breathing room
    let minP = Infinity;
    let maxP = -Infinity;
    let maxVol = 0;

    this.candles.forEach(c => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const pad = (maxP - minP) * 0.16;
    minP -= pad;
    maxP += pad;
    const priceRange = maxP - minP || 1;

    const getY = (val) => marginTop + candleAreaH - ((val - minP) / priceRange) * candleAreaH;
    const getX = (idx) => marginLeft + (idx + 0.5) * (plotW / this.candles.length);
    const candleW = Math.max(3, (plotW / this.candles.length) * 0.68);

    // 1. Grid lines
    this.drawGrid(ctx, marginLeft, marginTop, plotW, candleAreaH, minP, maxP, marginRight);

    // 2. CPR Zones
    if (this.options.showCpr && this.cpr && this.cpr.p) {
      this.drawCPR(ctx, marginLeft, plotW, getY);
    }

    // 3. Support & Resistance Zones
    if (this.options.showSr) {
      this.drawSR(ctx, marginLeft, plotW, getY);
    }

    // 4. Volume Bars
    if (this.options.showVolume) {
      this.drawVolume(ctx, marginLeft, marginTop + candleAreaH, plotW, volumeH, maxVol);
    }

    // 5. Multi-EMA Trend Ribbon
    if (this.options.showEma) {
      this.drawEMARibbon(ctx, getX, getY);
    }

    // 6. VWAP line
    if (this.options.showVwap) {
      this.drawVWAP(ctx, getX, getY);
    }

    // 7. Candlesticks
    this.drawCandlesticks(ctx, getX, getY, candleW);

    // 8. Buy/Sell Signals (Corrected swapped positions)
    if (this.options.showSignals) {
      this.drawSignals(ctx, getX, getY);
    }

    // 9. Right Price Scale & Axis
    this.drawPriceScale(ctx, w - marginRight, marginTop, candleAreaH, minP, maxP);

    // 10. Crosshair
    if (this.crosshair.active) {
      this.drawCrosshair(ctx, marginLeft, marginTop, plotW, candleAreaH, minP, maxP, w - marginRight);
    }
  }

  drawGrid(ctx, x, y, w, h, minP, maxP, marginRight) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal price lines
    const lines = 5;
    for (let i = 0; i <= lines; i++) {
      const lineY = y + (h / lines) * i;
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + w, lineY);
      ctx.stroke();
    }

    // Vertical time grid lines
    const vSteps = 6;
    for (let j = 0; j <= vSteps; j++) {
      const lineX = x + (w / vSteps) * j;
      ctx.beginPath();
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX, y + h + 24);
      ctx.stroke();
    }
  }

  drawCPR(ctx, x, w, getY) {
    if (!this.cpr || !this.cpr.p) return;
    const yTC = getY(this.cpr.tc);
    const yP = getY(this.cpr.p);
    const yBC = getY(this.cpr.bc);

    // Shaded CPR band
    ctx.fillStyle = 'rgba(0, 245, 155, 0.05)';
    ctx.fillRect(x, Math.min(yTC, yBC), w, Math.max(2, Math.abs(yBC - yTC)));

    // CPR Central Pivot line
    ctx.strokeStyle = '#00F59B';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, yP);
    ctx.lineTo(x + w, yP);
    ctx.stroke();

    // CPR TC & BC boundary lines
    ctx.strokeStyle = 'rgba(0, 245, 155, 0.4)';
    ctx.beginPath();
    ctx.moveTo(x, yTC);
    ctx.lineTo(x + w, yTC);
    ctx.moveTo(x, yBC);
    ctx.lineTo(x + w, yBC);
    ctx.stroke();
    ctx.setLineDash([]);

    // CPR Tag (clean badge with dark backdrop, anchored on left edge to avoid center collisions)
    const text = 'CPR Range (P: ' + this.cpr.p.toFixed(this.decimals) + ')';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    const tw = ctx.measureText(text).width;
    const badgeW = tw + 10;
    const badgeH = 16;
    const badgeX = x + 8;
    const badgeY = Math.max(8, yP - 18);

    ctx.fillStyle = 'rgba(8, 14, 10, 0.9)';
    ctx.strokeStyle = 'rgba(0, 245, 155, 0.5)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00F59B';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, badgeX + 5, badgeY + badgeH / 2);
    ctx.textBaseline = 'alphabetic';
  }

  drawSR(ctx, x, w, getY) {
    if (!this.srLevels || !this.srLevels.length) return;
    this.srLevels.forEach(sr => {
      const y = getY(sr.price);
      const isRes = sr.type === 'resistance';

      // Shaded buffer box
      ctx.fillStyle = isRes ? 'rgba(255, 77, 90, 0.06)' : 'rgba(0, 245, 155, 0.06)';
      ctx.fillRect(x, y - 6, w, 12);

      // Dashed level line
      ctx.strokeStyle = isRes ? '#FF4D5A' : '#00F59B';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Clean label badge anchored on left margin to never obscure breakout candles
      const text = sr.label + ' [' + sr.price.toFixed(this.decimals) + ']';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      const tw = ctx.measureText(text).width;
      const badgeW = tw + 8;
      const badgeH = 15;
      const badgeX = x + 8;
      // Stagger: above resistance line, below support line
      const badgeY = Math.max(8, isRes ? y - 16 : y + 3);

      ctx.fillStyle = 'rgba(8, 14, 10, 0.9)';
      ctx.strokeStyle = isRes ? 'rgba(255, 77, 90, 0.6)' : 'rgba(0, 245, 155, 0.6)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isRes ? '#FF4D5A' : '#00F59B';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, badgeX + 4, badgeY + badgeH / 2);
      ctx.textBaseline = 'alphabetic';
    });
  }

  drawVolume(ctx, x, startY, w, h, maxVol) {
    const barW = Math.max(2, (w / this.candles.length) * 0.65);
    this.candles.forEach((c, i) => {
      const barX = x + (i + 0.5) * (w / this.candles.length) - barW / 2;
      const barH = (c.volume / (maxVol || 1)) * h;
      const isUp = c.close >= c.open;

      ctx.fillStyle = isUp ? 'rgba(0, 245, 155, 0.25)' : 'rgba(255, 77, 90, 0.25)';
      ctx.fillRect(barX, startY + h - barH, barW, barH);
    });
  }

  drawEMARibbon(ctx, getX, getY) {
    // 9 EMA (fast, bright neon green)
    this.drawLine(ctx, this.candles.map((c, i) => ({ x: getX(i), y: getY(c.ema9) })), '#00F59B', 1.8);
    // 21 EMA (medium, emerald)
    this.drawLine(ctx, this.candles.map((c, i) => ({ x: getX(i), y: getY(c.ema21) })), '#10B981', 1.4);
    // 50 EMA (slow, teal dashed)
    this.drawLine(ctx, this.candles.map((c, i) => ({ x: getX(i), y: getY(c.ema50) })), '#06B6D4', 1.2, [3, 3]);
  }

  drawVWAP(ctx, getX, getY) {
    this.drawLine(ctx, this.candles.map((c, i) => ({ x: getX(i), y: getY(c.vwap) })), '#A855F7', 1.6);
  }

  drawLine(ctx, points, color, lineWidth = 1.5, dash = []) {
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawCandlesticks(ctx, getX, getY, candleW) {
    this.candles.forEach((c, i) => {
      const x = getX(i);
      const isUp = c.close >= c.open;
      const color = isUp ? '#00F59B' : '#FF4D5A';

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yOpen - yClose));
      
      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);

      // Subtle border for high-definition clarity
      ctx.strokeStyle = isUp ? '#00D685' : '#E03E4B';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });
  }

  drawSignals(ctx, getX, getY) {
    if (!this.plotArea) return;
    const { top: plotTop, height: plotHeight } = this.plotArea;
    const badgeW = 58;
    const badgeH = 20;

    this.signals.forEach(s => {
      if (!this.candles[s.index]) return;
      const x = getX(s.index);
      const isBuy = s.type === 'buy';
      const candlePriceY = getY(s.price);

      // Compute ideal badge position with safety margins
      let badgeY;
      if (isBuy) {
        // Position below candle low
        badgeY = candlePriceY + 16;
        // Clamp so it never spills below the plotArea bottom
        if (badgeY + badgeH > plotTop + plotHeight - 2) {
          badgeY = plotTop + plotHeight - badgeH - 2;
        }
      } else {
        // Position above candle high
        badgeY = candlePriceY - badgeH - 16;
        // Clamp so it never spills above the plotArea top
        if (badgeY < plotTop + 4) {
          badgeY = plotTop + 4;
        }
      }

      const badgeX = x - badgeW / 2;
      const centerY = badgeY + badgeH / 2;

      // Glow effect for signal badges
      ctx.save();
      ctx.shadowColor = isBuy ? 'rgba(0, 245, 155, 0.5)' : 'rgba(255, 77, 90, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = isBuy ? 2 : -2;

      // Tag background
      ctx.fillStyle = isBuy ? '#00F59B' : '#FF4D5A';
      this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
      ctx.fill();
      ctx.restore();

      // Contrast border
      ctx.strokeStyle = isBuy ? '#00C87E' : '#E03E4B';
      ctx.lineWidth = 1;
      this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
      ctx.stroke();

      // Signal text
      ctx.fillStyle = '#060B08';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.text, x, centerY);

      // Clean arrow pointing directly at candlestick coordinates
      ctx.fillStyle = isBuy ? '#00F59B' : '#FF4D5A';
      ctx.beginPath();
      if (isBuy) {
        // Points UP towards candle low
        const targetTipY = Math.min(candlePriceY + 2, badgeY - 2);
        ctx.moveTo(x, targetTipY);
        ctx.lineTo(x - 5, badgeY);
        ctx.lineTo(x + 5, badgeY);
      } else {
        // Points DOWN towards candle high
        const targetTipY = Math.max(candlePriceY - 2, badgeY + badgeH + 2);
        ctx.moveTo(x, targetTipY);
        ctx.lineTo(x - 5, badgeY + badgeH);
        ctx.lineTo(x + 5, badgeY + badgeH);
      }
      ctx.closePath();
      ctx.fill();
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  drawPriceScale(ctx, x, y, h, minP, maxP) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const price = maxP - ((maxP - minP) / steps) * i;
      const posY = y + (h / steps) * i;
      ctx.fillText(price.toFixed(this.decimals), x + 6, posY);
    }
  }

  drawCrosshair(ctx, left, top, w, h, minP, maxP, rightX) {
    const { x, y } = this.crosshair;
    if (x < left || x > left + w || y < top || y > top + h) return;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;

    // Crosshair lines
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + w, y);
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + h + 24);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price badge on right axis
    const priceRange = maxP - minP || 1;
    const priceAtY = maxP - ((y - top) / h) * priceRange;

    ctx.fillStyle = '#00F59B';
    const tagW = 54;
    ctx.fillRect(rightX + 2, y - 9, tagW, 18);
    ctx.fillStyle = '#080F0C';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(priceAtY.toFixed(this.decimals), rightX + 5, y);

    // Time badge on bottom axis
    if (this.crosshair.candle && this.crosshair.candle.time) {
      const d = new Date(this.crosshair.candle.time);
      const timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
      ctx.fillStyle = 'rgba(16, 28, 20, 0.95)';
      ctx.strokeStyle = 'rgba(0, 245, 155, 0.5)';
      ctx.lineWidth = 1;
      const timeTagW = 44;
      const timeTagH = 16;
      const timeTagX = Math.max(left, Math.min(left + w - timeTagW, x - timeTagW / 2));
      const timeTagY = top + h + 8;
      this.roundRect(ctx, timeTagX, timeTagY, timeTagW, timeTagH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F59B';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(timeStr, timeTagX + timeTagW / 2, timeTagY + timeTagH / 2);
    }
  }
}

// Global initialization
window.QuantChartEngine = QuantChartEngine;
