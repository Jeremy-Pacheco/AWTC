import fs from 'fs';
import path from 'path';
import Router from 'router';
import finalhandler from 'finalhandler';

const router = Router();
const dist = path.join(process.cwd(), 'dist');

// Archivos estáticos simples
router.get('/:file(*)', (req, res) => {
  const filePath = path.join(dist, req.params.file);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Si no existe, devolvemos index.html
      fs.readFile(path.join(dist, 'index.html'), (err, html) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      });
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

import http from 'http';
const server = http.createServer((req, res) => router(req, res, finalhandler(req, res)));
server.listen(3000, () => console.log('Servidor SPA con router en puerto 3000'));
