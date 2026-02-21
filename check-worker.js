const VALID_SIGNATURES = [
    "48DD182A0012CC7C54C3A5427D1708D57FE58533B8248F008709A1D1BB31C55B"
];

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    try {
        const data = await request.json();
        let signature = data.signature;
        if (!signature) return Response.json({ repo: "" });

        signature = signature.replace(/:/g, "").toUpperCase();

        if (VALID_SIGNATURES.includes(signature)) {
            return Response.json({
                repo: "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json"
            });
        } else {
            return Response.json({ repo: "" });
        }
    } catch (e) {
        return Response.json({ repo: "" });
    }
}
