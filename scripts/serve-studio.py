"""Serve the prepared studio with its generated global response headers.

This local test server does not emulate Vercel routing, caching or protection.
"""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("port", type=int)
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error("port must be between 1024 and 65535")

    output = Path(__file__).resolve().parent.parent / ".vercel" / "output"
    static = output / "static"
    if not (static / "index.html").is_file():
        parser.error("prepared studio is missing; run pnpm run build:vercel")
    config = json.loads((output / "config.json").read_text(encoding="utf-8"))
    rules = [
        rule
        for rule in config.get("routes", [])
        if rule.get("src") == "/(.*)" and "headers" in rule
    ]
    if (
        config.get("version") != 3
        or len(rules) != 1
        or rules[0].get("continue") is not True
    ):
        parser.error("prepared studio must have one global response-header rule")
    headers = rules[0]["headers"]
    if (
        not isinstance(headers, dict)
        or not headers.get("Content-Security-Policy")
        or any(
            not isinstance(value, str) or "\r" in value or "\n" in value
            for value in headers.values()
        )
    ):
        parser.error("prepared studio has invalid global response headers")

    class PreparedStudioHandler(SimpleHTTPRequestHandler):
        def end_headers(self):
            for name, value in headers.items():
                self.send_header(name, value)
            super().end_headers()

    handler = partial(PreparedStudioHandler, directory=str(static))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Serving prepared studio on http://127.0.0.1:{args.port}", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
