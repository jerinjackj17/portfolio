import { kv } from "@vercel/kv";

/**
 * GET /api/views: increments and returns the portfolio visit counter.
 * Vercel KV is provisioned at deploy time; if the env vars are missing
 * (local dev, preview without KV), this returns { count: null } and the
 * footer widget renders a dash instead of a number.
 */
export async function GET() {
  try {
    const count = await kv.incr("jerin-portfolio:views");
    return Response.json({ count });
  } catch {
    return Response.json({ count: null });
  }
}
