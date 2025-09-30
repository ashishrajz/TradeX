export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
  
    if (!symbol) {
      return new Response("Missing symbol", { status: 400 });
    }
  
    try {
      const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
      const res = await fetch(url);
  
      if (!res.ok) {
        return new Response("Binance error", { status: 502 });
      }
  
      const data = await res.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      return new Response(String(err.message || err), { status: 500 });
    }
  }
  