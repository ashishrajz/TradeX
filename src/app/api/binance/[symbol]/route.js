// src/app/api/binance/[symbol]/route.js
export async function GET(req, { params }) {
  try {
    const symbol = params?.symbol;
    

    if (!symbol) return new Response("Symbol required", { status: 400 });

    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    const json = await res.json();
    

    const data = {
      Open: parseFloat(json.openPrice),
      High: parseFloat(json.highPrice),
      Low: parseFloat(json.lowPrice),
      Close: parseFloat(json.lastPrice),
      Volume: parseFloat(json.volume),
    };

   

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error in /api/binance/[symbol]:", err);
    return new Response(String(err), { status: 500 });
  }
}
