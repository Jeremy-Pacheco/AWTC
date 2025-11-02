import Router from 'router';
import finalhandler from 'finalhandler';

const router = Router();

// Captura cualquier ruta
router.get('/:file?', (req, res) => {
  // Si req.params.file es undefined, es la raíz "/"
  res.end(`Ruta capturada: ${req.params.file || 'home'}`);
});

import http from 'http';
const server = http.createServer((req, res) => router(req, res, finalhandler(req, res)));
server.listen(3000, () => console.log('Servidor corriendo'));
