const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const userRoutes = require('./rutas/users');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BD_usuarios';

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por IP cada 15 minutos
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
  }
});

app.use(limiter);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('onectado a MongoDB exitosamente');
  console.log(`Base de datos: ${mongoose.connection.name}`);
})
.catch((error) => {
  console.error('Error conectando a MongoDB:', error.message);
  process.exit(1);
});

// Event listeners para MongoDB
mongoose.connection.on('error', (error) => {
  console.error('Error de MongoDB:', error);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Desconectado de MongoDB');
});

// Rutas
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Conectada' : 'Desconectada'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Usuarios',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: {
        getAll: 'GET /api/users',
        create: 'POST /api/users',
        getById: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      }
    }
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    const errors = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }
  
  // Error de duplicado en MongoDB
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Ya existe un usuario con ese ${field === 'email' ? 'correo electrónico' : field}`
    });
  }
  
  // Error de casting (ID inválido)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario inválido'
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/users',
      'POST /api/users',
      'GET /api/users/:id',
      'PUT /api/users/:id',
      'DELETE /api/users/:id'
    ]
  });
});

// Función para cerrar gracefully
process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  await mongoose.connection.close();
  console.log('Conexión a MongoDB cerrada');
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('Servidor iniciado exitosamente');
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('Endpoints disponibles:');
  console.log('   GET    / - Información de la API');
  console.log('   GET    /api/health - Estado del servidor');
  console.log('   GET    /api/users - Listar usuarios');
  console.log('   POST   /api/users - Crear usuario');
  console.log('   GET    /api/users/:id - Obtener usuario');
  console.log('   PUT    /api/users/:id - Actualizar usuario');
  console.log('   DELETE /api/users/:id - Eliminar usuario');
});

module.exports = app;