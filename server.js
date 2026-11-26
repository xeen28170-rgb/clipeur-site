// Petit serveur pour tester le site en local (npm start). En ligne, le site est servi par GitHub Pages.
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
const pub = path.join(__dirname, 'docs');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const send = (res, code, file) => { res.writeHead(code, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res); };
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]).replace(/^\/clipeur-site/, '').replace(/\/+$/, '') || '/index';
  let full = path.join(pub, path.normalize(url));
  if (!path.extname(full)) full += '.html';
  if (!full.startsWith(pub) || !fs.existsSync(full)) return send(res, 404, path.join(pub, '404.html'));
  send(res, 200, full);
}).listen(PORT, '0.0.0.0', () => console.log('Clipeur site : http://localhost:' + PORT));
