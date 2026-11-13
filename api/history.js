// Full NVDA price history since the purchase, fetched server-side every time the app opens.
// Nothing needs to stay open on the phone. Source: Yahoo Finance chart data (no key needed).
const BOUGHT = Date.UTC(2026, 10, 13, 18, 31) / 1000; // 13 Nov 2026, 20:31 Israel time

export default async function handler(req, res) {
  const now = Math.floor(Date.now() / 1000);
  const ageDays = (now - BOUGHT) / 86400;
  const interval = ageDays < 55 ? "5m" : ageDays < 700 ? "1h" : "1d";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/NVDA?period1=${BOUGHT}&period2=${now}&interval=${interval}&includePrePost=false`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const j = await r.json();
    const d = j.chart.result[0];
    const ts = d.timestamp || [], cl = d.indicators.quote[0].close || [];
    const points = ts.map((t, i) => ({ t: t * 1000, p: cl[i] })).filter(x => x.p != null);
    const m = d.meta;
    res.setHeader("Cache-Control", "s-maxage=30");
    res.status(200).json({
      points,
      price: m.regularMarketPrice,
      prevClose: m.chartPreviousClose ?? m.previousClose,
      time: (m.regularMarketTime || now) * 1000,
    });
  } catch (e) {
    res.status(502).json({ error: "History unavailable" });
  }
}
