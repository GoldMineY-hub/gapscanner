# Gap Scanner

Een gratis **momentum aandelen scanner** voor Nederlandse en Belgische day traders. Scant elke ochtend alle aandelen op NYSE en NASDAQ op gap-up kansen met nieuws, volume en momentum. Gebaseerd op de bewezen strategie van Ross Cameron (Warrior Trading).

Volledig in het Nederlands. Geen abonnement, geen registratie, geen creditcard vereist.

**Live app:** [goldminey-hub.github.io/gapscanner](https://goldminey-hub.github.io/gapscanner/)

---

## Wat doet de scanner?

De scanner haalt alle gainers van de hele Amerikaanse beurs op via de FMP API en filtert ze op vier criteria uit de Ross Cameron strategie: gap %, prijs, volume en nieuws katalysator. Alles draait via jouw eigen gratis Cloudflare Worker zodat je data nooit langs externe servers gaat.

---

## Functies

### Gap Scanner
- Scant alle aandelen op NYSE en NASDAQ via FMP stable API
- Geen vaste watchlist maar echt alle US aandelen
- Filterbaar op Min Gap %, Min Prijs en Max Prijs
- Top 10 resultaten gesorteerd op gap % hoog naar laag
- Auto-refresh elke 1, 2 of 5 minuten
- CSV export van de resultaten
- NIEUW en HOT badges per aandeel

### Nieuws per gapper
Voor elk gevonden aandeel worden maximaal 5 bedrijfsspecifieke nieuwsberichten opgehaald uit 6 bronnen tegelijk, gesorteerd op kwaliteit en relevantie:

| Bron | Type | Gratis |
|---|---|---|
| SEC EDGAR 8-K | Officiele filings | Ja |
| Business Wire | Persberichten | Ja |
| GlobeNewswire | Persberichten | Ja |
| PR Newswire | Persberichten | Ja |
| Yahoo Finance RSS | Per ticker nieuws | Ja |
| Google News RSS | Alle bronnen per ticker | Ja |
| Finnhub company-news | Aggregator | Finnhub key |

Nieuws wordt gescoord op bronkwaliteit, catalyst keywords (FDA, earnings, contract, merger) en recentheid. Generieke marktoverzichten van Chartmill, Seeking Alpha en MarketBeat worden gefilterd.

### Markt paneel
Altijd zichtbare horizontale balk bovenaan de pagina:
- SPY en QQQ prijs en % verandering
- VIX waarde met sentiment pill: Rustig / Gemiddeld / Hoog risico
- Markt status: Open / Pre-market / After-hours / Gesloten
- Dynamische strategie tip gebaseerd op marktomstandigheden
- Beste scan tijd indicatie

### Context banner
Automatisch bijgewerkte banner die precies vertelt welke data je ziet en wanneer je terug moet komen voor verse data. Werkt op basis van de huidige ET tijd en wordt elke minuut bijgewerkt.

### Gisteren's Movers
- Top 10 stijgers en top 10 dalers van gisteren
- Zelfde multi-source nieuws per aandeel als de scanner
- Gebruik dit voor je watchlist in de pre-market

### Catalysts vandaag
Drie tabs met marktbewegende informatie:

**Earnings tab** — Earnings nieuws van vandaag uit Benzinga, Google News en GlobeNewswire. Gefilterd op earnings keywords. Volledig gratis, geen API key nodig.

**FDA tab** — Recente FDA-gerelateerde 8-K filings van SEC EDGAR. Volledig gratis, geen API key nodig.

**Sectoren tab** — Sector performance van vandaag via FMP. Toont welke sector leidt en welke achterblijft. Vereist FMP key.

### Live nieuws feed
Automatisch verversend nieuws panel elke 2 minuten met bronnen: Benzinga, GlobeNewswire, PR Newswire, Business Wire, AccessWire en Finnhub.

### YouTube sectie
Laatste 6 videos van Ross Cameron (Warrior Trading) via YouTube RSS.

---

## Instellen

### Stap 1 — Cloudflare Worker

1. Ga naar [workers.cloudflare.com](https://workers.cloudflare.com) en maak een gratis account aan
2. Klik Workers en Pages, Create, Create Worker
3. Geef de Worker een naam zoals `gap-scanner`
4. Klik Edit code, verwijder alle bestaande code
5. Kopieer de worker code van de Instellen tab op de site en plak deze erin
6. Klik Deploy
7. Kopieer je Worker URL: `https://gap-scanner.jouwnaam.workers.dev`

100.000 gratis verzoeken per dag, meer dan genoeg voor dagelijks gebruik.

### Stap 2 — FMP API key

1. Ga naar [financialmodelingprep.com](https://financialmodelingprep.com)
2. Maak een gratis account aan, geen creditcard nodig
3. 250 gratis API calls per dag, 2 calls per scan = 100 scans per dag
4. Kopieer je API key van het dashboard

### Stap 3 — Finnhub API key

1. Ga naar [finnhub.io](https://finnhub.io)
2. Maak een gratis account aan, geen creditcard nodig
3. 60 API calls per minuut gratis
4. Kopieer je API key van het dashboard

### Stap 4 — Keys invoeren

1. Open de scanner pagina
2. Klik Worker URL instellen, plak je Worker URL, klik Test
3. Klik API keys invoeren
4. Plak je FMP key en Finnhub key in de juiste velden
5. Keys worden automatisch opgeslagen in je browser

---

## Worker API routes

| Route | Beschrijving | Key nodig |
|---|---|---|
| `/scan` | Alle US gainers scannen | FMP + Finnhub |
| `/market` | SPY, QQQ en VIX | Finnhub |
| `/news` | Algemene nieuws feed | Optioneel |
| `/movers` | Gisteren stijgers en dalers | FMP + Finnhub |
| `/earnings` | Earnings nieuws vandaag | Geen |
| `/fda` | FDA filings via SEC EDGAR | Geen |
| `/sectors` | Sector performance | FMP |
| `/videos` | Ross Cameron YouTube | Geen |
| `/debug` | FMP API debug info | FMP |
| `/health` | Worker status | Geen |

---

## Tijden voor Europese traders

| Tijd (CET) | Wat te doen |
|---|---|
| 10:00 | Pre-market start, eerste nieuws zichtbaar |
| 13:00 tot 15:15 | Beste scan window, watchlist opbouwen |
| 15:15 tot 15:30 | Finale selectie voor open |
| 15:30 | Amerikaanse beurs opent |
| 15:30 tot 16:30 | Primair trading window, sterkste momentum |
| 22:00 | Beurs sluit |

---

## GoldMineY

Gebouwd door een Nederlandse day trader. Onderdeel van het GoldMineY project.

- Gap Scanner: [goldminey-hub.github.io/gapscanner](https://goldminey-hub.github.io/gapscanner/)
- VSA Trader: [goldminey-hub.github.io/vsa-trader](https://goldminey-hub.github.io/vsa-trader/)
- GitHub: [github.com/goldminey-hub](https://github.com/goldminey-hub)
- Reddit: [reddit.com/r/GoldMineY](https://reddit.com/r/GoldMineY)

---

*Disclaimer: Alles op deze pagina is uitsluitend voor educatieve doeleinden. Handelen brengt risico's met zich mee. Je kunt een deel of al je inleg verliezen.*
