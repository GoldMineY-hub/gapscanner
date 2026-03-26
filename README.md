# Gap Scanner

A free **momentum stock scanner** for Dutch and Belgian day traders. Scan US markets every morning for gap-up stocks with news, volume and momentum. Based on the proven strategy of Ross Cameron from Warrior Trading. No account, no subscription, no credit card required.

🇳🇱 The interface is fully in Dutch, built for traders in the Netherlands, Belgium and across Europe.

🌐 **Live app:** [goldminey-hub.github.io/gapscanner](https://goldminey-hub.github.io/gapscanner/)

---

## What does it do?

The scanner checks 300+ active small-cap US stocks every scan and filters them by four criteria from the Ross Cameron momentum strategy:

1. **Price between $1 and $20.** Low-priced stocks are more volatile and attract more traders
2. **Minimum 10% gap up:** The stock opened significantly higher than yesterday's close
3. **High relative volume:** At least 5x more trading activity than normal
4. **News catalyst:** An FDA approval, earnings beat, contract announcement or merger driving the move

Stocks matching all criteria are ranked by score and displayed with their news headline, source and volume data.

---

## Features

| Feature | Description |
|---|---|
| 📡 **Gap Scanner** | Scans 300+ small-cap stocks for gap-up opportunities every run |
| 📰 **Live News Feed** | Merges headlines from Benzinga, GlobeNewswire, PR Newswire and Finnhub |
| 📊 **Market Panel** | Live SPY, QQQ and VIX quotes refreshed every minute |
| 🔔 **News Auto-refresh** | News feed updates automatically every 2 minutes in the background |
| 📺 **Ross Cameron Videos** | Latest YouTube videos from Warrior Trading loaded automatically |
| 📥 **CSV Export** | Export scan results to a spreadsheet with one click |
| ⏱ **Auto Refresh** | Set the scanner to run automatically every 1, 2 or 5 minutes |
| 💾 **Settings saved** | Worker URL and API key saved in your browser. Enter once, works every time |

---

## News Sources

The scanner pulls news from four sources simultaneously every scan:

| Source | Type | Speed |
|---|---|---|
| **Benzinga** | Market news, earnings, analyst ratings | Fast |
| **GlobeNewswire** | Company press releases, FDA, contracts | Real-time |
| **PR Newswire** | Company press releases | Real-time |
| **Finnhub** | Market news with ticker tags | Fast |

News items are ranked by catalyst keywords, source quality and recency. FDA approvals, earnings beats and contract announcements always rank highest.

---

## The Ross Cameron Strategy

Ross Cameron of Warrior Trading developed a daily system for finding the strongest momentum stocks. The scanner applies his four core criteria automatically:

| Criterion | Why it matters |
|---|---|
| **Price $1 to $20** | Low-priced stocks move faster. A rise from $2 to $4 is already 100% gain. |
| **Min 10% gap up** | Signals strong buying pressure from overnight news. |
| **High relative volume** | Confirms real interest. 5x normal volume means traders are paying attention. |
| **News catalyst** | Without a reason to move, the gap is likely to fail. |

---

## Best Times to Use the Scanner (CET)

The US market opens at 15:30 CET. These are the optimal windows from the Netherlands and Belgium:

| Time (CET) | Window | Description |
|---|---|---|
| 10:00 to 13:00 | Pre-market prep | News breaks, first volume visible. Build your watchlist. |
| 13:00 to 15:15 | Best scan window | News active, volume building. Ross Cameron scans here. |
| 15:15 to 15:30 | Final selection | Lock your watchlist before the open. |
| 15:30 to 16:30 | First trading hour | Market opens. Primary window for momentum strategies. |

---

## Getting Started

### Step 1: Get a free Finnhub API key

Go to [finnhub.io](https://finnhub.io) and create a free account. No credit card needed. Works from anywhere in Europe. You get 60 API calls per minute on the free tier.

### Step 2: Deploy a free Cloudflare Worker

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) and create a free account
2. Click **Workers & Pages** → **Create** → **Create Worker** → click **Deploy**
3. Click **Edit Code**, select all, delete and paste the `worker.js` code from this repository
4. Click **Deploy** and copy your Worker URL

Your Worker URL looks like this: `https://gap-scanner.yourname.workers.dev`

### Step 3: Open the app and enter your settings

Open the live app, enter your Worker URL and Finnhub API key in the config fields at the top. Both are saved in your browser automatically. Press **Scannen** and your results appear within seconds.

---

## How it works

```
Browser (your computer)
    │
    ▼
Cloudflare Worker (your free worker)
    │
    ├── Finnhub API       → real-time quotes for 300+ stocks
    ├── Benzinga RSS      → fast market news
    ├── GlobeNewswire RSS → company press releases
    └── PR Newswire RSS   → company press releases
    │
    ▼
Filter by gap %, price range and volume
Match stocks to news catalysts
Rank by score
    │
    ▼
Results displayed in browser
```

Your Finnhub API key is passed directly to the Worker on each request. It is never stored on any server. Settings are saved only in your own browser localStorage.

---

## Multiple Users

Each person uses their own free Finnhub API key. Your daughters or other family members can use the same Worker URL with their own API key. Keys are stored separately in each person's browser. Everyone can scan simultaneously without affecting each other.

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript |
| Backend | Cloudflare Workers (free tier) |
| Market data | Finnhub API (free tier) |
| News | Benzinga RSS, GlobeNewswire RSS, PR Newswire RSS |
| Hosting | GitHub Pages |

No frameworks, no build tools, no dependencies. Works in any modern browser.

---

## Related Tools

| Tool | Description | Link |
|---|---|---|
| 📊 **VSA Trader** | Volume Spread Analysis tool for reading institutional activity | [goldminey-hub.github.io/vsa-trader](https://goldminey-hub.github.io/vsa-trader/) |

Both tools are free, open source and built for European traders.

---

## YouTube

Step-by-step tutorials in Dutch on how to use the Gap Scanner are available on the **GoldMineY** YouTube channel. Learn how to apply the Ross Cameron momentum strategy from the Netherlands.

---

## Disclaimer

This tool is for **educational purposes only**. Trading involves risk. You can lose (part of) your investment. Past performance is not indicative of future results. This is not financial advice.

---

## License

MIT — free to use, modify and distribute.
