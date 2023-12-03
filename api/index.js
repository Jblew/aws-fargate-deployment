const http = require("http");
const url = require("url");

const handler = (req, res) => {
  console.log("Method:", req.method);

  const urlParts = url.parse(req.url, true);
  console.log("Path:", urlParts.pathname);
  console.log("Query parameters:", urlParts.query);
  console.log("Headers:", req.headers);

  let body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", () => {
    body = Buffer.concat(body).toString();
    body = body ? body : "nobody";

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      url: req.url,
      headers: req.headers,
      body,
    }));
  });
};

const port = parseInt(process.env.PORT) || 8080;
const server = http.createServer(handler);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
