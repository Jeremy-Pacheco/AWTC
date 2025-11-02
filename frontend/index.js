import http from 'http';
import fs from 'fs';
import path from 'path';
import Router from 'router';
import finalhandler from 'finalhandler';

const router = Router();
const publicFolder = path.resolve('./frontend/dist');

// Servir archivos estáticos con ruta exacta
router.get('/index.html', serveFile);
router.get('/favicon.ico', serveFile);
router.get('/vite.svg', serveFile);
// Agrega aquí más archivos estáticos si quieres

// Ruta catch-all para React Router (cualquier otra ruta devuelve index.html)
router.get('*', (req, res) => {
const filePath = path.join(publicFolder, 'index.html');
fs.readFile(filePath, (err, content) => {
if (err) {
res.statusCode = 500;
res.end('Error al cargar index.html');
} else {
res.setHeader('Content-Type', 'text/html');
res.end(content);
}
});
});

function serveFile(req, res) {
const filePath = path.join(publicFolder, req.url);
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
res.statusCode = 404;
res.end('Archivo no encontrado');
} else {
res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
res.end(content);
}
});
}

const server = http.createServer((req, res) => router(req, res, finalhandler(req, res)));
server.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
