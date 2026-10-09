/**
 * Interactive TradingView Candlestick Chart Engine
 * Confluenc Quant Indicator [v6.1.12]
 * 
 * Features:
 * - High-DPI Canvas Rendering
 * - Realistic Japanese Candlesticks with Wicks
 * - Multi-EMA Ribbon (Dynamic trend smoothing)
 * - Automatic Support & Resistance Price Zones
 * - VWAP (Volume Weighted Average Price) Curve
 * - CPR (Central Pivot Range: TC, P, BC)
 * - Algorithmic Buy/Sell Signal Callout Markers
 * - Volume Histogram
 * - Interactive Crosshair with Price/Time labels
 * - Toggles for Indicator Layers and Multiple Markets/Timeframes
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

    this.candles = [];
    this.signals = [];
    this.srLevels = [];
    this.cpr = {};
    this.crosshair = { active: false, x: 0, y: 0, candle: null };

    this.init();
  }

  init() {
    this.generateMarketData(this.options.currentMarket, this.options.currentTimeframe);
    this.setupResizeListener();
    this.setupInteractivity();
    this.render();
  }

  setupResizeListener() {
    this.resizePending = false;
    const resizeObserver = new ResizeObserver(() => {
      if (this.resizePending) return;
      this.resizePending = true;
      requestAnimationFrame(() => {
        this.resizePending = false;
        this.resizeCanvas();
        this.requestRender();
      });
    });
    resizeObserver.observe(this.container);
    this.resizeCanvas();
  }

  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    // Cap DPR at 2 for performance efficiency on high-density mobile displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    // Adapt dynamically to container height without forcing desktop 380px minimum on mobile
    this.height = rect.height || (window.innerWidth < 640 ? 320 : 420);

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
    let basePrice = 67200;
    let volatility = 120;
    let decimals = 2;

    if (symbol.includes('NIFTY')) {
      basePrice = 24850;
      volatility = 45;
    } else if (symbol.includes('BANKNIFTY')) {
      basePrice = 51400;
      volatility = 110;
    } else if (symbol.includes('EUR')) {
      basePrice = 1.0850;
      volatility = 0.0015;
      decimals = 4;
    } else if (symbol.includes('GOLD')) {
      basePrice = 2650;
      volatility = 8;
    }

    this.symbol = symbol;
    this.timeframe = tf;
    this.decimals = decimals;

    const count = Math.max(35, Math.min(55, Math.floor(this.width ? this.width / 18 : 45)));
    this.candles = [];
    let current = basePrice;
    const now = Date.now();
    const intervalMs = tf === '1m' ? 60000 : tf === '5m' ? 300000 : tf === '15m' ? 900000 : tf === '1h' ? 3600000 : 86400000;

    // Generate trending swing wave pattern
    for (let i = 0; i < count; i++) {
      const time = now - (count - i) * intervalMs;
      // Controlled rhythmic trend with waves
      const wave = Math.sin(i * 0.28) * volatility * 1.8 + Math.cos(i * 0.12) * volatility;
      const noise = (Math.random() - 0.48) * volatility * 0.8;
      
      const open = current;
      const close = current + (i > count * 0.65 ? (volatility * 0.45 + noise) : noise);
      const high = Math.max(open, close) + Math.random() * volatility * 0.6;
      const low = Math.min(open, close) - Math.random() * volatility * 0.6;
      const volume = Math.floor(Math.random() * 850 + (Math.abs(close - open) > volatility * 0.5 ? 1200 : 350));

      this.candles.push({ time, open, high, low, close, volume });
      current = close;
    }

    // Calculate moving averages for EMA Ribbon
    this.calculateIndicators();
  }

  calculateIndicators() {
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
      vwap.push(cumVolPrice / cumVol);
      
      c.ema9 = ema9[idx];
      c.ema21 = ema21[idx];
      c.ema50 = ema50[idx];
      c.vwap = vwap[idx];
    });

    // CPR Pivot Levels (Pivot = (H+L+C)/3, BC = (H+L)/2, TC = (Pivot - BC) + Pivot)
    const recentHigh = Math.max(...this.candles.slice(0, 20).map(c => c.high));
    const recentLow = Math.min(...this.candles.slice(0, 20).map(c => c.low));
    const recentClose = this.candles[19].close;

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

    // Algorithmic Buy/Sell Signals
    this.signals = [];
    const len = this.candles.length;
    if (len > 12) {
      // Find bullish crossover
      for (let i = 10; i < len - 3; i++) {
        if (this.candles[i].close > this.candles[i].ema9 && this.candles[i - 1].close <= this.candles[i - 1].ema9 && !this.signals.some(s => s.type === 'buy')) {
          this.signals.push({ index: i, type: 'buy', price: this.candles[i].low, text: 'BUY ▲' });
        }
      }
      // Sell marker
      const sellIdx = Math.floor(len * 0.52);
      this.signals.push({ index: sellIdx, type: 'sell', price: this.candles[sellIdx].high, text: 'SELL ▼' });
    }
  }

  calcEMA(data, period) {
    const k = 2 / (period + 1);
    const emaArray = [data[0]];
    for (let i = 1; i < data.length; i++) {
      emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
    }
    return emaArray;
  }

  setupInteractivity() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.crosshair.active = true;
      this.crosshair.x = x;
      this.crosshair.y = y;
      this.updateCrosshairCandle(x);
      this.requestRender();
    }, { passive: true });

    this.canvas.addEventListener('mouseleave', () => {
      this.crosshair.active = false;
      this.requestRender();
      this.resetHudInfo();
    }, { passive: true });

    // Touch support for mobile charts
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.crosshair.active = true;
        this.crosshair.x = x;
        this.crosshair.y = y;
        this.updateCrosshairCandle(x);
        this.requestRender();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.crosshair.active = false;
      this.requestRender();
      this.resetHudInfo();
    }, { passive: true });
  }

  updateCrosshairCandle(x) {
    if (!this.plotArea) return;
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
      const pct = (diff / candle.open) * 100;
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
    this.generateMarketData(symbol, this.options.currentTimeframe);
    this.requestRender();
    this.resetHudInfo();
  }

  setTimeframe(tf) {
    this.options.currentTimeframe = tf;
    this.generateMarketData(this.options.currentMarket, tf);
    this.requestRender();
    this.resetHudInfo();
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Background fill
    ctx.fillStyle = '#080D0A';
    ctx.fillRect(0, 0, w, h);

    // Margins
    const marginTop = 30;
    const marginBottom = 50;
    const marginLeft = 15;
    const marginRight = 65;

    const plotW = w - marginLeft - marginRight;
    const plotH = h - marginTop - marginBottom;
    const volumeH = plotH * 0.22;
    const candleAreaH = plotH - volumeH;

    this.plotArea = { left: marginLeft, top: marginTop, width: plotW, height: candleAreaH };

    // Find min and max price
    let minP = Infinity;
    let maxP = -Infinity;
    let maxVol = 0;

    this.candles.forEach(c => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const pad = (maxP - minP) * 0.08;
    minP -= pad;
    maxP += pad;
    const priceRange = maxP - minP || 1;

    const getY = (val) => marginTop + candleAreaH - ((val - minP) / priceRange) * candleAreaH;
    const getX = (idx) => marginLeft + (idx + 0.5) * (plotW / this.candles.length);
    const candleW = Math.max(3, (plotW / this.candles.length) * 0.68);

    // 1. Grid lines
    this.drawGrid(ctx, marginLeft, marginTop, plotW, candleAreaH, minP, maxP, marginRight);

    // 2. CPR Zones
    if (this.options.showCpr && this.cpr) {
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

    // 8. Signals (Buy/Sell)
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
      ctx.lineTo(lineX, y + h + 35);
      ctx.stroke();
    }
  }

  drawCPR(ctx, x, w, getY) {
    const yTC = getY(this.cpr.tc);
    const yP = getY(this.cpr.p);
    const yBC = getY(this.cpr.bc);

    // Shaded CPR band
    ctx.fillStyle = 'rgba(0, 245, 155, 0.05)';
    ctx.fillRect(x, Math.min(yTC, yBC), w, Math.abs(yBC - yTC));

    // CPR Central Pivot
    ctx.strokeStyle = '#00F59B';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, yP);
    ctx.lineTo(x + w, yP);
    ctx.stroke();

    // CPR TC & BC
    ctx.strokeStyle = 'rgba(0, 245, 155, 0.45)';
    ctx.beginPath();
    ctx.moveTo(x, yTC);
    ctx.lineTo(x + w, yTC);
    ctx.moveTo(x, yBC);
    ctx.lineTo(x + w, yBC);
    ctx.stroke();
    ctx.setLineDash([]);

    // CPR Tag
    ctx.fillStyle = 'rgba(0, 245, 155, 0.9)';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CPR Range (P: ' + this.cpr.p.toFixed(this.decimals) + ')', x + 10, yP - 5);
  }

  drawSR(ctx, x, w, getY) {
    this.srLevels.forEach(sr => {
      const y = getY(sr.price);
      const isRes = sr.type === 'resistance';

      // Shaded buffer box
      ctx.fillStyle = isRes ? 'rgba(255, 77, 90, 0.07)' : 'rgba(0, 245, 155, 0.07)';
      ctx.fillRect(x, y - 8, w, 16);

      // Line
      ctx.strokeStyle = isRes ? '#FF4D5A' : '#00F59B';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = isRes ? '#FF4D5A' : '#00F59B';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(sr.label + ' [' + sr.price.toFixed(this.decimals) + ']', x + w - 150, y - 4);
    });
  }

  drawVolume(ctx, x, startY, w, h, maxVol) {
    const barW = Math.max(2, (w / this.candles.length) * 0.6);
    this.candles.forEach((c, i) => {
      const barX = x + (i + 0.5) * (w / this.candles.length) - barW / 2;
      const barH = (c.volume / (maxVol || 1)) * h;
      const isUp = c.close >= c.open;

      ctx.fillStyle = isUp ? 'rgba(0, 245, 155, 0.22)' : 'rgba(255, 77, 90, 0.22)';
      ctx.fillRect(barX, startY + h - barH, barW, barH);
    });
  }

  drawEMARibbon(ctx, getX, getY) {
    // 9 EMA (fast, bright neon green)
    this.drawLine(ctx, this.candles.map((c, i) => ({ x: getX(i), y: getY(c.ema9) })), '#00F59B', 1.8);
    // 21 EMA (medium, emerald)
    this.drawLine(ctx, this.candles.map((c, i) => ({ x: getX(i), y: getY(c.ema21) })), '#10B981', 1.4);
    // 50 EMA (slow, teal)
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

      // Subtle border for high contrast
      ctx.strokeStyle = isUp ? '#00D685' : '#E03E4B';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });
  }

  drawSignals(ctx, getX, getY) {
    this.signals.forEach(s => {
      const x = getX(s.index);
      const isBuy = s.type === 'buy';
      const y = isBuy ? getY(s.price) + 24 : getY(s.price) - 24;

      // Tag background
      ctx.fillStyle = isBuy ? '#00F59B' : '#FF4D5A';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x - 28, y - 10, 56, 20, 4);
      } else {
        ctx.rect(x - 28, y - 10, 56, 20);
      }
      ctx.fill();

      // Signal text
      ctx.fillStyle = '#060B08';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.text, x, y);

      // Arrow pointing to candlestick
      ctx.fillStyle = isBuy ? '#00F59B' : '#FF4D5A';
      ctx.beginPath();
      if (isBuy) {
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x - 5, y - 6);
        ctx.lineTo(x + 5, y - 6);
      } else {
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x - 5, y + 6);
        ctx.lineTo(x + 5, y + 6);
      }
      ctx.fill();
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  drawPriceScale(ctx, x, y, h, minP, maxP) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px "JetBrains Mono", monospace';

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const price = maxP - ((maxP - minP) / steps) * i;
      const posY = y + (h / steps) * i;
      ctx.fillText(price.toFixed(this.decimals), x + 8, posY + 4);
    }
  }

  drawCrosshair(ctx, left, top, w, h, minP, maxP, rightX) {
    const { x, y } = this.crosshair;
    if (x < left || x > left + w || y < top || y > top + h) return;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;

    // Crosshair lines
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + w, y);
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + h + 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price badge on right axis
    const priceRange = maxP - minP;
    const priceAtY = maxP - ((y - top) / h) * priceRange;

    ctx.fillStyle = '#00F59B';
    ctx.fillRect(rightX + 4, y - 9, 60, 18);
    ctx.fillStyle = '#080F0C';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(priceAtY.toFixed(this.decimals), rightX + 8, y + 4);
  }
}

// Global initialization
window.QuantChartEngine = QuantChartEngine;
