addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

const VALID_SIGNATURES = [
  "B3C8506BC302B7FC21720BF39DB48BFC757804F755F2407998F3A319A8DC7EA1"
]

const REPO_URL = "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json"

let CURRENT_NONCE = null

function generateNonce() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => ("0" + b.toString(16)).slice(-2)).join("").toUpperCase()
}

async function handleRequest(request) {
  try {
    const url = new URL(request.url)

    if (url.pathname === "/challenge") {
      CURRENT_NONCE = generateNonce()
      return new Response(JSON.stringify({ nonce: CURRENT_NONCE }), {
        headers: { "Content-Type": "application/json" }
      })
    }

    if (url.pathname === "/verify") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "POST only" }), { status: 405 })
      }

      const data = await request.json()
      const hashSent = data.hash?.toUpperCase() || ""
      const nonce = data.nonce?.toUpperCase() || ""

      if (!CURRENT_NONCE || nonce !== CURRENT_NONCE) {
        return new Response(JSON.stringify({ repos: [] }), {
          headers: { "Content-Type": "application/json" }
        })
      }

      CURRENT_NONCE = null

      const encoder = new TextEncoder()
      const validHashes = await Promise.all(VALID_SIGNATURES.map(async sig => {
        const data = encoder.encode(sig + nonce)
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)
        return Array.from(new Uint8Array(hashBuffer)).map(b => ("0" + b.toString(16)).slice(-2)).join("").toUpperCase()
      }))

      if (validHashes.includes(hashSent)) {
        return new Response(JSON.stringify({
          repos: [{ url: REPO_URL }]
        }), {
          headers: { "Content-Type": "application/json" }
        })
      } else {
        return new Response(JSON.stringify({ repos: [] }), {
          headers: { "Content-Type": "application/json" }
        })
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })

  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }
}
