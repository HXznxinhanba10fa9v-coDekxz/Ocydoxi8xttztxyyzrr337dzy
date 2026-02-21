const VALID_SIGNATURES = [
    "B3C8506BC302B7FC21720BF39DB48BFC757804F755F2407998F3A319A8DC7EA1"
];

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method !== "POST") {
        return new Response("Not Found", { status: 404 });
    }

    try {
        const data = await request.json();
        let signature = data.signature;
        if (!signature) return new Response("Not Found", { status: 404 });

        signature = signature.replace(/:/g, "").toUpperCase();

        if (VALID_SIGNATURES.includes(signature)) {
            return Response.json({
                repo: "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json"
            });
        } else {
            return new Response("Not Found", { status: 404 });
        }
    } catch (e) {
        return new Response("Not Found", { status: 404 });
    }
}
