#!/usr/bin/env python3
"""
Lokální server pro WRF_Forecast_Viewer.

Spuštění:
    python3 serve.py            # defaultně port 8000
    python3 serve.py 8080       # jiný port

Proč místo `python3 -m http.server`:
Defaultní http.server neposílá žádné hlavičky proti cache, takže prohlížeč
ukládá starou verzi index.html / js/* a po opravě souborů na disku pořád
ukazuje starý obsah. Tento skript nastaví `Cache-Control: no-cache`, takže
každé obnovení stránky vždy načte čerstvé soubory.
"""
import http.server
import socketserver
import functools
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Každé obnovení načte čerstvé soubory (žádná cache).
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        print("[serve.py] %s" % (fmt % args))

with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"[serve.py] WRF_Forecast_Viewer na http://localhost:{PORT}")
    print("[serve.py] Ctrl+C pro zastaveni")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[serve.py] zastaveno")
