addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

const VALID_SIGNATURES = [
  "B3C8506BC302B7FC21720BF39B48BFC757804F755F2407998F3A319A8DC7EA1"
]

const REPOS = [
  {
    name: "M0ViesM0d68",
    url: "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json"
  },
  {
    name: "NonT0nM0vies21",
    url: "https://pastebin.com/raw/J9TtFFDX"
  }
]

const challenges = new Map()

function randomNonce() {
  return crypto.randomUUID().replace(/-/g, "")
}

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest("SHA-256", data)

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
}

async function handle(req) {

  const url = new URL(req.url)

  if (url.pathname === "/challenge") {

    const nonce = randomNonce()
    challenges.set(nonce, Date.now())

    return new Response(
      JSON.stringify({ nonce }),
      { headers: { "Content-Type": "application/json" } }
    )
  }

  if (url.pathname === "/verify" && req.method === "POST") {

    let body

    try {
      body = await req.json()
    } catch {
      return new Response("", { status: 200 })
    }

    const nonce = body?.nonce
    const hash = body?.hash?.toUpperCase()

    if (!nonce || !hash)
      return new Response("", { status: 200 })

    if (!challenges.has(nonce))
      return new Response("", { status: 200 })

    challenges.delete(nonce)

    for (const sig of VALID_SIGNATURES) {

      const expected = await sha256(sig + nonce)

      if (expected === hash) {
        return new Response(
          JSON.stringify({ repos: REPOS }),
          { headers: { "Content-Type": "application/json" } }
        )
      }
    }

    return new Response("", { status: 200 })
  }

  return new Response("Not Found", { status: 404 })
}
