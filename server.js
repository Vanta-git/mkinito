const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const host = process.env.HOST || '0.0.0.0';
// Use the platform-provided port when present. Locally, port 0 lets the OS
// choose an available port so this does not collide with another app.
const port = process.env.PORT ? Number(process.env.PORT) : 0;
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.pck': 'application/octet-stream',
  '.png': 'image/png',
};
const securityHeaders = {
  // Godot's threaded WebAssembly build requires cross-origin isolation.
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);

  if (requestPath === '/health') {
    response.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      ...securityHeaders,
    });
    response.end('ok');
    return;
  }

  const filePath = path.resolve(root, `.${requestPath === '/' ? '/index.html' : requestPath}`);

  if (!filePath.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      ...securityHeaders,
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, host, () => {
  const actualPort = server.address().port;
  console.log(`KinitoPET is available at http://localhost:${actualPort}/`);
});