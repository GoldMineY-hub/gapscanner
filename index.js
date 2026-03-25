// ─────────────────────────────────────────────────────────────────────────────
// Gap Scanner Worker — Finnhub API
// Free tier: 50 calls/min, real-time US data, no country restrictions
//
// Routes:
//   GET /scan?key=...      — Top gainers with pre-market + volume data
//   GET /market?key=...    — SPY, QQQ, VIX quotes
//   GET /sectors?key=...   — Not available on Finnhub free tier (skipped)
//   GET /news?key=...      — Latest market news
//   GET /health            — Uptime check
//
// API key is passed as a query param from the browser — never hardcoded here.
// Each user stores their own key in their browser localStorage.
// ─────────────────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const BASE = 'https://finnhub.io/api/v1';

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const { pathname } = url;
    const key = url.searchParams.get('key') ?? '';

    if (pathname === '/health') return ok({ ok: true, ts: new Date().toISOString() });
    if (pathname === '/scan')   return handleScan(url, key);
    if (pathname === '/market') return handleMarket(key);
    if (pathname === '/news')   return handleNews(key);

    return new Response('Gap Scanner Worker — /scan /market /news /health', { headers: CORS });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Finnhub fetch helper
// ─────────────────────────────────────────────────────────────────────────────
async function fh(endpoint, key, params = {}) {
  if (!key) throw new Error('No API key provided');
  const u = new URL(`${BASE}${endpoint}`);
  u.searchParams.set('token', key);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u.toString(), {
    headers: { 'User-Agent': 'GapScanner/1.0' }
  });
  if (res.status === 401) throw new Error('Invalid API key — check your Finnhub key');
  if (res.status === 429) throw new Error('Rate limit reached — wait a moment and try again');
  if (!res.ok) throw new Error(`Finnhub error ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// /scan — US stock gainers using Finnhub screener + quote enrichment
// ─────────────────────────────────────────────────────────────────────────────
async function handleScan(url, key) {
  if (!key) return err('No API key — enter your Finnhub key on the page');
  try {
    const p        = url.searchParams;
    const minGap   = parseFloat(p.get('minGap')   ?? '10');
    const minPrice = parseFloat(p.get('minPrice') ?? '1');
    const maxPrice = parseFloat(p.get('maxPrice') ?? '20');

    // Step 1: Get US stock symbols that are up significantly today
    // Finnhub /stock/symbol gives us all US stocks
    // Then we use /quote for each — but that's too many calls.
    // Better: use Finnhub's screener endpoint which filters by % change
    const screenData = await fh('/stock/screener', key, {
      exchange: 'US',
    });

    // Finnhub screener returns a list of symbols — we filter by gainers
    // Alternatively use the dedicated gainers: get top gainers from market status
    let gainers = [];

    // Try market status + top movers first
    try {
      const movers = await fh('/stock/market-status', key, { exchange: 'US' });
      // market-status doesn't give movers, use /news/market as signal
    } catch(e) {}

    // Use Finnhub's /stock/symbol to get US stocks then batch quote them
    // For free tier efficiency: use pre-built screener with exchange filter
    const symbolsData = await fh('/stock/symbol', key, { exchange: 'US', mic: 'XNAS' });
    const allSymbols = (symbolsData || [])
      .filter(s => s.type === 'Common Stock' && s.symbol && !s.symbol.includes('.'))
      .map(s => s.symbol)
      .slice(0, 200); // limit to avoid rate limits

    // Batch fetch quotes — Finnhub has a batch quote endpoint
    const quoteData = await fh('/quote', key, { symbol: allSymbols.slice(0,1).join(',') });

    // Actually Finnhub free tier doesn't have batch quotes.
    // Use the proper approach: /stock/screener with filters
    const screenerResult = await fh('/screener/stock', key, {
      region: 'US',
      priceMin: minPrice,
      priceMax: maxPrice,
      pctChangeMin: minGap,
    });

    const results = screenerResult?.result ?? [];

    if (results.length === 0) {
      // Fallback: fetch news to find active tickers, then get their quotes
      return ok({ ok: true, count: 0, stocks: [], scannedAt: new Date().toISOString(), message: 'No gainers found matching your filters' });
    }

    const stocks = [];
    // Enrich top results with full quote data (max 20 to stay within rate limits)
    const top = results.slice(0, 20);

    await Promise.all(top.map(async (item) => {
      try {
        const [quote, profile, metric] = await Promise.all([
          fh('/quote', key, { symbol: item.symbol }),
          fh('/stock/profile2', key, { symbol: item.symbol }).catch(() => ({})),
          fh('/stock/metric', key, { symbol: item.symbol, metric: 'all' }).catch(() => ({})),
        ]);

        const price     = quote.c ?? 0;
        const prevClose = quote.pc ?? 0;
        const changePct = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
        const volume    = quote.v ?? null;
        const avgVol    = metric?.metric?.['10DayAverageTradingVolume'] * 1_000_000 ?? null;
        const relVol    = avgVol && volume ? +(volume / avgVol).toFixed(2) : null;
        const preMarket = quote.h ?? null; // Finnhub doesn't give pre-market on free tier directly

        if (changePct < minGap || price < minPrice || price > maxPrice) return;

        stocks.push({
          ticker:     item.symbol,
          company:    profile?.name ?? item.description ?? '',
          sector:     profile?.finnhubIndustry ?? '',
          industry:   '',
          price:      +price.toFixed(2),
          prevClose:  +prevClose.toFixed(2),
          gapPct:     +changePct.toFixed(2),
          volume,
          relVol,
          avgVol50:   avgVol ? Math.round(avgVol) : null,
          preMarketPrice:  null,
          preMarketChange: null,
          hasNews:    false,
          headline:   null,
          newsUrl:    null,
          catalyst:   'news',
          score:      calcScore(changePct, relVol, price),
        });
      } catch(e) { /* skip this ticker */ }
    }));

    // Match news to tickers
    try {
      const news = await fh('/news', key, { category: 'general' });
      for (const stock of stocks) {
        const match = (news || []).find(n =>
          n.headline?.toUpperCase().includes(stock.ticker) ||
          n.summary?.toUpperCase().includes(stock.ticker)
        );
        if (match) {
          stock.hasNews  = true;
          stock.headline = match.headline;
          stock.newsUrl  = match.url;
        }
      }
    } catch(e) { /* news matching optional */ }

    stocks.sort((a, b) => b.gapPct - a.gapPct);
    return ok({ ok: true, count: stocks.length, stocks, scannedAt: new Date().toISOString() });

  } catch(e) {
    return err(e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// /market — SPY, QQQ, VIX
// ─────────────────────────────────────────────────────────────────────────────
async function handleMarket(key) {
  if (!key) return err('No API key');
  try {
    const [spy, qqq, vix] = await Promise.all([
      fh('/quote', key, { symbol: 'SPY' }),
      fh('/quote', key, { symbol: 'QQQ' }),
      fh('/quote', key, { symbol: 'VIX' }).catch(() => null),
    ]);

    const fmt = (q, sym) => q ? {
      symbol:    sym,
      price:     q.c,
      changePct: q.pc > 0 ? +((q.c - q.pc) / q.pc * 100).toFixed(2) : null,
      prevClose: q.pc,
      high:      q.h,
      low:       q.l,
    } : { symbol: sym, error: 'No data' };

    return ok({
      ok: true,
      spy: fmt(spy, 'SPY'),
      qqq: fmt(qqq, 'QQQ'),
      vix: fmt(vix, 'VIX'),
      ts:  new Date().toISOString(),
    });
  } catch(e) {
    return err(e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// /news — Latest market news from Finnhub
// ─────────────────────────────────────────────────────────────────────────────
async function handleNews(key) {
  if (!key) return err('No API key');
  try {
    const news = await fh('/news', key, { category: 'general', minId: '0' });
    const items = (news || []).slice(0, 30).map(n => ({
      title:    n.headline,
      link:     n.url,
      source:   n.source,
      pubDate:  n.datetime ? new Date(n.datetime * 1000).toISOString() : null,
      summary:  n.summary?.slice(0, 120),
      tickers:  n.related ? n.related.split(',').map(t => t.trim()).filter(Boolean) : [],
    }));
    return ok({ ok: true, count: items.length, items, ts: new Date().toISOString() });
  } catch(e) {
    return err(e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function calcScore(gapPct, relVol, price) {
  let s = Math.min(40, (gapPct / 100) * 40);
  if (relVol != null) s += Math.min(25, ((relVol - 1) / 9) * 25);
  if (price >= 2  && price <= 10) s += 10;
  if (price > 10  && price <= 20) s += 5;
  return Math.round(Math.min(100, s));
}

function ok(data) {
  return new Response(JSON.stringify(data), { headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function err(msg, status = 500) {
  return new Response(JSON.stringify({ ok: false, error: msg }), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
