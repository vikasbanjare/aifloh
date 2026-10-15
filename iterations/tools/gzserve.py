# Local static server that gzips text like GitHub Pages does, so Lighthouse numbers match production.
# Usage: python3 iterations/tools/gzserve.py dist   (serves on :4332)
import gzip, http.server, os, sys
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path): path = os.path.join(path, 'index.html')
        ctype = self.guess_type(path)
        if 'gzip' in self.headers.get('Accept-Encoding', '') and os.path.isfile(path) and ctype.split(';')[0] in ('text/html','text/css','application/javascript','text/javascript','image/svg+xml','application/json'):
            data = gzip.compress(open(path,'rb').read())
            self.send_response(200); self.send_header('Content-Type', ctype); self.send_header('Content-Encoding','gzip'); self.send_header('Content-Length', str(len(data))); self.end_headers()
            import io; return io.BytesIO(data)
        return super().send_head()
os.chdir(sys.argv[1]); http.server.ThreadingHTTPServer(('', 4332), H).serve_forever()
