import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// LongPort quote API is WebSocket/protobuf only — no REST equivalent.
// Use Windows Python (python.exe) which has longbridge SDK installed.
// Credentials are passed as CLI args since WSL env vars don't cross the boundary.
// Windows Python dir is added to gateway's PATH via systemd drop-in override.conf
const PYTHON_EXE = "python.exe";
const PYTHON_SCRIPT = `
import sys, json
from longbridge.openapi import Config, QuoteContext
app_key, app_secret, token, symbol = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
config = Config.from_apikey(app_key=app_key, app_secret=app_secret, access_token=token)
ctx = QuoteContext(config)
q = ctx.quote([symbol])
r = q[0]
print(json.dumps({
    "symbol": r.symbol,
    "last_done": str(r.last_done),
    "prev_close": str(r.prev_close),
    "open": str(r.open),
    "high": str(r.high),
    "low": str(r.low),
    "volume": r.volume,
    "turnover": str(r.turnover),
    "timestamp": r.timestamp.timestamp() if r.timestamp else None
}))
`.trim();

export default async function getQuote({ ticker }) {
  const appKey = process.env.LONGPORT_APP_KEY;
  const appSecret = process.env.LONGPORT_APP_SECRET;
  const token = process.env.LONGPORT_ACCESS_TOKEN;

  if (!appKey || !appSecret || !token) {
    throw new Error("Missing LONGPORT_APP_KEY / LONGPORT_APP_SECRET / LONGPORT_ACCESS_TOKEN env vars");
  }

  const { stdout, stderr } = await execFileAsync(
    PYTHON_EXE,
    ["-c", PYTHON_SCRIPT, appKey, appSecret, token, ticker],
    { timeout: 15000 }
  );

  if (stderr) {
    // longbridge prints a permissions table to stderr — filter real errors
    const realErrors = stderr.split("\n").filter(l =>
      l.includes("Error") || l.includes("Exception") || l.includes("Traceback")
    );
    if (realErrors.length > 0) {
      throw new Error(`longbridge error: ${realErrors.join(" ")}`);
    }
  }

  // longbridge prints a permissions table to stdout before the JSON — find the JSON line
  const jsonLine = stdout.split("\n").find(l => l.trim().startsWith("{"));
  if (!jsonLine) {
    throw new Error(`No JSON in output: ${stdout.slice(0, 200)}`);
  }
  const data = JSON.parse(jsonLine.trim());

  return {
    ticker: data.symbol,
    price: parseFloat(data.last_done),
    prevClose: parseFloat(data.prev_close),
    open: parseFloat(data.open),
    high: parseFloat(data.high),
    low: parseFloat(data.low),
    volume: data.volume,
    turnover: parseFloat(data.turnover),
    timestamp: data.timestamp ? Math.round(data.timestamp * 1000) : Date.now()
  };
}
