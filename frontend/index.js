import http from 'http';
import fs from 'fs';
import path from 'path';
import Router from 'router';
import finalhandler from 'finalhandler';

const router = Router();

// Carpeta donde está el build de producción
const publicFolder = path.resolve('./frontend/dist');

// Servir archivos estáticos
router.get('/:file(*)', (req, res) => {
let requestedPath = req.params.file || 'index.html';
const filePath = path.join(publicFolder, requestedPath);

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
});

const server = http.createServer((req, res) => router(req, res, finalhandler(req, res)));
server.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
