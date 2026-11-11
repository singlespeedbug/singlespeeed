export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": "https://singlespeeed.com",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const raw = await env.VISITS.get("count");
    const next = parseInt(raw ?? "0", 10) + 1;
    await env.VISITS.put("count", String(next));

    return new Response(JSON.stringify({ count: next }), { headers });
  },
};
