export default async function getQuote({ ticker }) {
  const appKey = process.env.LONGPORT_APP_KEY;
  const secret = process.env.LONGPORT_APP_SECRET;
  const token = process.env.LONGPORT_ACCESS_TOKEN;

  const url = `https://api.longportapp.com/v1/quote/${ticker}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-KEY": appKey,
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  return {
    ticker,
    price: data.last_done,
    change: data.change_rate,
    volume: data.volume,
    timestamp: Date.now()
  };
}