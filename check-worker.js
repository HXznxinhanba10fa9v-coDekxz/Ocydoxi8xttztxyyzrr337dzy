const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9qvXo4hfzFMW1pT5DkdF
I+gC/UVI2/jIvU3C7cNvQjU2Hd4wNnU8qVr1obpIYYBnoiDZW1VBsgm5Jw8/A5jn
UXV9sv5CBzqnuII41ugdfvZTdwooDYtUIc2yq+AGlnyZlB/2FUozXCM8vxVLuoPp
RIVkjkxb3unprNNgIn7sSujhKeCAcXViiEkIw8KQBAiA/xHpetpK6jDz/Y3j7ON/
DVuLicg/45bDvjGQRw6F9waNQRZEd909u3f/BCD/PnpZpSLIcK1IsOZmZgfNPjWT
fBfykiPJwhOaw8llCDNpyPgtSs+6j2SJaOw4ioucWl+Dzup4XIdk4TFugnBi1D+d
/QIDAQAB
-----END PUBLIC KEY-----`;

const REPO_URL = "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json";
let CURRENT_NONCE = null;

// Hasil hash dari APK + nonce dikirim client
async function importPublicKey(pem) {
    const b64 = pem.replace(/-----.*?-----/g, '').replace(/\s+/g, '');
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
        'spki',
        raw.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
    );
}

async function verifySignature(signatureB64, data) {
    const key = await importPublicKey(PUBLIC_KEY_PEM);
    const sigBuffer = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    const dataBuffer = new TextEncoder().encode(data);
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sigBuffer, dataBuffer);
}

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

function generateNonce() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => ("0" + b.toString(16)).slice(-2)).join("").toUpperCase();
}

async function handleRequest(request) {
    const url = new URL(request.url);

    if (url.pathname === "/challenge") {
        CURRENT_NONCE = generateNonce();
        return new Response(JSON.stringify({ nonce: CURRENT_NONCE }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/verify") {
        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
        }

        const data = await request.json();
        const signature = data.signature || "";
        const nonce = data.nonce || "";

        if (!CURRENT_NONCE || nonce !== CURRENT_NONCE) {
            return new Response(JSON.stringify({ repos: [] }), { headers: { "Content-Type": "application/json" } });
        }

        CURRENT_NONCE = null;

        const valid = await verifySignature(signature, nonce);
        if (valid) {
            return new Response(JSON.stringify({ repos: [{ url: REPO_URL }] }), { headers: { "Content-Type": "application/json" } });
        } else {
            return new Response(JSON.stringify({ repos: [] }), { headers: { "Content-Type": "application/json" } });
        }
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
}
