# Sistema de Gestión de Usuarios - Naiuska Janeth Zipa Intriago

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="JavaScript">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js">
</div>

<div align="center">
  <h3>Sistema completo con formulario HTML, API REST en Node.js y base de datos MongoDB para la gestión de usuarios con validaciones del lado del cliente y servidor.</h3>
</div>

---

## Capturas del Sistema

### Interfaz Principal

<img width="1359" height="714" alt="Captura de pantalla 2025-07-26 174426" src="https://github.com/user-attachments/assets/12efab65-a55e-47f2-8af2-a4dc92b5f897" />

### Lista de Usuarios

<img width="1359" height="717" alt="image" src="https://github.com/user-attachments/assets/b6703bc0-1a6a-44ff-864d-9e920ebd3a90" />

## 📁 Estructura del Proyecto

```
proyecto/
├── frontend/
│   ├── index.html          # Interfaz principal
│   ├── script.js           # Lógica del cliente
├── backend/
│   ├── index.js            # Servidor principal
│   ├── rutas/
│   │   └── users.js        # Rutas de usuarios
│   ├── package.json        # Dependencias
│   ├── .env.example        # Variables de entorno ejemplo
│   └── data.json           # Datos de respaldo
└── README.md
```

## Características

- **Validaciones completas** - Cliente y servidor
- **Diseño responsivo** - Compatible con móviles
- **API REST completa** - CRUD de usuarios
- **Dashboard de estadísticas** - Métricas en tiempo real
- **CORS configurado** - Listo para producción
- **Base de datos MongoDB** - Escalable y flexible
- **Actualizaciones en tiempo real** - Sin recargar página

## Instalación y Configuración

### Prerrequisitos

- ![Node.js](https://img.shields.io/badge/Node.js-v16+-green) Node.js (versión 16 o superior)
- ![MongoDB](https://img.shields.io/badge/MongoDB-latest-green) MongoDB (local o MongoDB Atlas)
- ![npm](https://img.shields.io/badge/npm-latest-red) npm o yarn

### 1. 🔧 Configuración del Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install
```

### 3. Iniciar el Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

### 4. Configuración del Frontend

```bash
# Navegar a la carpeta frontend
cd frontend

# Abrir index.html en un servidor web local
# Opción 1: Usar Live Server en VS Code
# Opción 2: Usar Python
python -m http.server 5500

# Opción 3: Usar Node.js
npx http-server -p 5500
```

## 🔧 Configuración de Variables de Entorno

Edita el archivo `.env` en la carpeta backend:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/BD_usuarios
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500
```

## Endpoints de la API

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/users` | Obtener todos los usuarios |
| `GET` | `/api/users/:id` | Obtener usuario por ID |
| `POST` | `/api/users` | Crear nuevo usuario |
| `PUT` | `/api/users/:id` | Actualizar usuario |
| `DELETE` | `/api/users/:id` | Eliminar usuario |
| `GET` | `/api/users/estadisticas/resumen` | Obtener estadísticas |

### 🛠️ Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Información de la API |
| `GET` | `/api/health` | Estado del servidor |

## Pruebas de la API 

### Con Postman

1. Importar la colección usando estos endpoints
2. Configurar el entorno con `baseUrl: http://localhost:3000`
3. Probar cada endpoint

## Dependencias

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.8.1"
}
```

### DevDependencies
```json
{
  "nodemon": "^3.0.1"
}
```

## Autor

**Naiuska Zipa Intriago**
- GitHub: [@NaiuskaZipa21](https://github.com/NaiuskaZipa21)
- Email: nzipa0516@utm.edu.ec

---

<div align="center">
  <p>⭐ ¡Dale una estrella si te gustó el proyecto! ⭐</p>
</div>
