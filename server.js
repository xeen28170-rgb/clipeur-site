const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
const pub = path.join(__dirname, 'public');
const routes = { '/': 'index.html', '/terms': 'terms.html', '/privacy': 'privacy.html' };
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.txt': 'text/plain' };
http.createServer((req, res) => {
  const url = req.url.split('?')[0].replace(/\/+$/, '') || '/';
  let file = routes[url] || url.slice(1);
  const full = path.join(pub, path.normalize(file));
  if (!full.startsWith(pub) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404');
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(full)] || 'application/octet-stream' });
  fs.createReadStream(full).pipe(res);
}).listen(PORT, '0.0.0.0', () => console.log('ClipForge site on port ' + PORT));
