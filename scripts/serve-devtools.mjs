import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/fixture.js", ["fixture.js", "text/javascript; charset=utf-8"]],
  ["/fixtures.json", ["fixtures.json", "application/json; charset=utf-8"]],
]);
const port = Number(process.env.CONSOLE_FX_FIXTURE_PORT ?? 4176);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid fixture port");
const server = createServer(async (request, response) => {
  const file = files.get(
    new URL(request.url ?? "/", "http://localhost").pathname,
  );
  if (!file) {
    response.writeHead(404).end();
    return;
  }
  try {
    const content = await readFile(resolve(".artifacts/devtools", file[0]));
    response.writeHead(200, {
      "Content-Type": file[1],
      "Cache-Control": "no-store",
    });
    response.end(content);
  } catch {
    response.writeHead(500).end("Build fixtures first.");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`ConsoleFX qualification fixtures: http://127.0.0.1:${port}`),
);
