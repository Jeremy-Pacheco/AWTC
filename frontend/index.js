import http from 'http';
import fs from 'fs';
import path from 'path';
import Router from 'router';
import finalhandler from 'finalhandler';

const router = Router();

// Carpeta de build de Vite (tras ejecutar `vite build`)
const publicFolder = path.resolve('./frontend/dist');

// Servir archivos estáticos
router.get('*', (req, res) => {
let filePath = path.join(publicFolder, req.url === '/' ? 'index.html' : req.url);

fs.stat(filePath, (err, stats) => {
// Si no existe o es un directorio que no es index.html, devolvemos index.html para SPA
if (err || stats.isDirectory()) {
filePath = path.join(publicFolder, 'index.html');
}

const ext = path.extname(filePath).toLowerCase();
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

fs.readFile(filePath, (err, content) => {
  if (err) {
    res.statusCode = 500;
    res.end('Error al cargar el archivo');
  } else {
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.end(content);
  }
});

});
});

// Crear servidor y escuchar en el puerto 3000
const server = http.createServer((req, res) => router(req, res, finalhandler(req, res)));
server.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
