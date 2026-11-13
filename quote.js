// Server-side proxy so the Finnhub key stays secret (set FINNHUB_KEY in Vercel env vars).
export default async function handler(req, res) {
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(500).json({ error: "FINNHUB_KEY not set" });
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=NVDA&token=${key}`);
    const q = await r.json();
    if (!q || !q.c) return res.status(502).json({ error: "No quote" });
    res.setHeader("Cache-Control", "s-maxage=15");
    res.status(200).json({ price: q.c, change: q.d, changePct: q.dp, high: q.h, low: q.l, open: q.o, prevClose: q.pc, time: q.t * 1000 });
  } catch (e) {
    res.status(502).json({ error: "Fetch failed" });
  }
}
