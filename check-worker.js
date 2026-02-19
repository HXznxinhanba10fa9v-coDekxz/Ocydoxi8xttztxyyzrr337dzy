addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const VALID_SIG = "B3C8506BC302B7FC21720BF39B48BFC757804F755F2407998F3A319A8DC7EA1"

const REPOS = [
  { name: "M0ViesM0d68", url: "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json" },
  { name: "NonT0nM0vies21", url: "https://pastebin.com/raw/J9TtFFDX" }
]

async function handleRequest(request) {
  if (request.method !== "POST") return new Response("Only POST allowed", { status: 405 })

  try {
    const body = await request.json()
    if (body.signature !== VALID_SIG) return new Response("", { status: 200 })
    return new Response(JSON.stringify({ repos: REPOS }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 })
  }
}