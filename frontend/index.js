import Router from 'router';
import finalhandler from 'finalhandler';

const router = Router();

// Ruta simple con parámetro obligatorio
router.get('/:file', (req, res) => {
  res.end(`Archivo: ${req.params.file}`);
});

// Para la raíz "/"
router.get('/', (req, res) => {
  res.end('Ruta raíz');
});

import http from 'http';
const server = http.createServer((req, res) => router(req, res, finalhandler(req, res)));
server.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
