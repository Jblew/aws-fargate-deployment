const handler: Deno.ServeHandler = async (req) => {
  console.log("Method:", req.method);

  const url = new URL(req.url);
  console.log("Path:", url.pathname);
  console.log("Query parameters:", url.searchParams);
  console.log("Headers:", req.headers);
  const body = req.body ? await req.text() : "nobody";

  return Response.json({
    url: req.url,
    headers: [...req.headers.entries()],
    body,
  });
};

const port = parseInt(Deno.env.get("PORT") || "8080");
Deno.serve({ port }, handler);
