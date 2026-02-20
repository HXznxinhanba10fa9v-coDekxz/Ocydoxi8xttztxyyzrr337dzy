export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("", { status: 403 });
    }

    try {
      const { sig, ts, hmac } = await request.json();

      const VALID_SIGNATURE = env.APP_SIGNATURE;
      const SECRET = env.SECRET_KEY;

      if (!sig || sig !== VALID_SIGNATURE) {
        return new Response("", { status: 200 });
      }

      const now = Math.floor(Date.now() / 1000);
      if (!ts || Math.abs(now - ts) > 60) {
        return new Response("", { status: 200 });
      }

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const data = encoder.encode(sig + ts);
      const buffer = await crypto.subtle.sign("HMAC", key, data);

      const generated = [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      if (generated !== hmac) {
        return new Response("", { status: 200 });
      }

      return fetch("https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json");

    } catch {
      return new Response("", { status: 200 });
    }
  }
};
