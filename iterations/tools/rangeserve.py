# Static server with HTTP Range support (like GitHub Pages), so video seeking works in local tests.
# Usage: python3 iterations/tools/rangeserve.py dist [port, default 4331]
import http.server, os, re, sys

class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, 'index.html')
        if not rng or not os.path.isfile(path):
            return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        size = os.path.getsize(path)
        start = int(m.group(1) or 0)
        end = int(m.group(2)) if m.group(2) else size - 1
        end = min(end, size - 1)
        f = open(path, 'rb'); f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        self._remaining = end - start + 1
        return f
    def copyfile(self, source, outputfile):
        n = getattr(self, '_remaining', None)
        if n is None:
            return super().copyfile(source, outputfile)
        while n > 0:
            chunk = source.read(min(65536, n))
            if not chunk: break
            outputfile.write(chunk); n -= len(chunk)
        self._remaining = None

os.chdir(sys.argv[1] if len(sys.argv) > 1 else 'dist')
http.server.ThreadingHTTPServer(('', int(sys.argv[2]) if len(sys.argv) > 2 else 4331), H).serve_forever()
