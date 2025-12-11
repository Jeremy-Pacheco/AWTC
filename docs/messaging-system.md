# Sistema de Mensajería con WebSockets - AWTC

## 📋 Descripción
Sistema de mensajería en tiempo real para la plataforma AWTC que permite la comunicación entre administradores y coordinadores usando WebSockets (Socket.IO).

## ✨ Características Implementadas

### Backend
- **Modelo de Mensajes**: Tabla `Messages` con campos senderId, receiverId, content, isRead, timestamps
- **Socket.IO Server**: Servidor WebSocket integrado con autenticación
- **Eventos en Tiempo Real**:
  - `send_message`: Enviar mensaje
  - `receive_message`: Recibir mensaje
  - `typing` / `stop_typing`: Indicadores de escritura
  - `mark_as_read`: Marcar mensajes como leídos
  - `online_users`: Lista de usuarios conectados
- **API REST**:
  - `GET /api/messages/conversations`: Lista de conversaciones
  - `GET /api/messages/history/:userId`: Historial con un usuario
  - `PUT /api/messages/:messageId/read`: Marcar como leído
  - `GET /api/messages/unread-count`: Cantidad de no leídos
  - `GET /api/messages/available-users`: Usuarios disponibles (admins y coordinators)

### Frontend
- **Componente Chat**: Interfaz completa de mensajería
- **Página Messages**: Página dedicada con autenticación
- **Características UI**:
  - Lista de conversaciones con contador de no leídos
  - Indicador de usuarios en línea
  - Indicador de "escribiendo..."
  - Confirmación de lectura (doble check)
  - Auto-scroll de mensajes
  - Diseño responsive con Tailwind CSS

## 🚀 Instalación

### 1. Instalar Dependencias

**Backend** (en terminal de `backend/`):
```bash
npm install socket.io
```

**Frontend** (en terminal de `frontend/`):
```bash
npm install socket.io-client
```

### 2. Ejecutar Migraciones

```bash
cd backend
npm run migrate
```

Esto creará la tabla `Messages` en la base de datos.

## 📝 Uso

### Iniciar el Sistema

1. **Iniciar Docker** (LDAP):
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Iniciar Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   El servidor WebSocket estará disponible en `http://localhost:8080`

3. **Iniciar Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Accede a `http://localhost:5173`

### Acceder a la Mensajería

1. Inicia sesión como **administrador** o **coordinador**:
   - Admin: `admin@awtc.es` / `adminawtc1234`
   - Coordinador: `juan@gmail.com` / `juan`

2. Navega a `/messages` o haz clic en el enlace de mensajería en el navbar

3. Selecciona un usuario de la lista de conversaciones o inicia una nueva

4. ¡Envía mensajes en tiempo real!

## 🔐 Seguridad

- Solo usuarios con rol `admin` o `coordinator` pueden acceder a la mensajería
- Autenticación de Socket.IO mediante userId y userRole
- Validación de permisos en cada evento del servidor
- Los mensajes solo se pueden enviar entre admins y coordinators

## 🎨 Características de UI

### Conversaciones
- Avatar con inicial del nombre
- Indicador verde de usuario conectado
- Último mensaje y fecha
- Contador de mensajes no leídos

### Chat
- Mensajes propios (verde) vs recibidos (blanco)
- Timestamp de cada mensaje
- Doble check (✓✓) para mensajes leídos
- Indicador de "escribiendo..." con animación
- Separadores de fecha (Hoy, Ayer, etc.)
- Auto-scroll al nuevo mensaje

## 🔧 Configuración

### Variables de Entorno

Asegúrate de tener en `backend/.env.development`:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=1234
DB_NAME=db_awtc_development
FRONTEND_URL=http://localhost:5173
```

### CORS

El servidor acepta conexiones desde:
- `http://localhost:5173` (frontend local)
- `http://localhost:8080` (backend local)
- `http://209.97.187.131:5173` (producción)
- `http://209.97.187.131:8080` (producción)

## 📚 Estructura de Archivos Creados

### Backend
```
backend/
├── models/
│   └── message.js                  # Modelo Sequelize
├── migrations/
│   └── 20251211120000-create-messages.js
├── controllers/
│   └── message.controller.js       # Controlador REST
├── routes/
│   └── message.routes.js           # Rutas API
├── config/
│   └── socket.js                   # Configuración Socket.IO
└── index.js                        # Integración WebSocket
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   └── Chat.tsx                # Componente principal
│   ├── pages/
│   │   └── Messages.tsx            # Página de mensajería
│   └── App.tsx                     # Rutas actualizadas
```

## 🐛 Solución de Problemas

### Error: Socket.IO no conecta
- Verifica que el backend esté corriendo
- Revisa la consola del navegador para errores de CORS
- Asegúrate de estar autenticado como admin o coordinator

### Error: Mensajes no se guardan
- Ejecuta las migraciones: `npm run migrate`
- Verifica la conexión a MySQL
- Revisa los logs del backend para errores de base de datos

### Error: "Authentication error"
- Verifica que localStorage tenga `token` y `user`
- Confirma que el usuario tiene rol `admin` o `coordinator`
- Revisa que el userId se esté enviando correctamente en auth

## 🎯 Próximas Mejoras Sugeridas

- [ ] Notificaciones push para nuevos mensajes
- [ ] Soporte para imágenes/archivos adjuntos
- [ ] Búsqueda de mensajes
- [ ] Grupos de chat
- [ ] Historial de mensajes eliminados
- [ ] Emojis y reacciones
- [ ] Videollamadas/llamadas de voz

## 📖 Documentación de Referencia

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)

---

**Desarrollado siguiendo las prácticas enseñadas en el PDF de WebSockets**
