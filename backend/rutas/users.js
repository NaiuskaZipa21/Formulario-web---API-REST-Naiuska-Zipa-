const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const router = express.Router();

// Esquema del Usuario
const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    validate: {
      validator: function(v) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v);
      },
      message: 'El nombre solo puede contener letras y espacios'
    }
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Email inválido'
    }
  },
  telefono: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Campo opcional
        return /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(v);
      },
      message: 'Formato de teléfono inválido'
    }
  },
  edad: {
    type: Number,
    required: [true, 'La edad es requerida'],
    min: [18, 'La edad mínima es 18 años'],
    max: [100, 'La edad máxima es 100 años'],
    validate: {
      validator: Number.isInteger,
      message: 'La edad debe ser un número entero'
    }
  },
  pais: {
    type: String,
    required: [true, 'El país es requerido'],
    enum: {
      values: ['Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Perú', 'Uruguay', 'Venezuela'],
      message: 'País no válido'
    }
  },
  comentarios: {
    type: String,
    trim: true,
    maxlength: [500, 'Los comentarios no pueden exceder 500 caracteres']
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar fechaActualizacion
userSchema.pre('findOneAndUpdate', function() {
  this.set({ fechaActualizacion: new Date() });
});

// Índices para mejorar rendimiento
userSchema.index({ email: 1 });
userSchema.index({ fechaCreacion: -1 });

const User = mongoose.model('User', userSchema);

// Middleware de validación personalizada
const validarDatosUsuario = (req, res, next) => {
  const { nombre, email, telefono, edad, pais } = req.body;
  const errores = {};

  // Validaciones adicionales del servidor
  if (nombre && nombre.trim().length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres';
  }

  if (email && !validator.isEmail(email)) {
    errores.email = 'Email inválido';
  }

  if (telefono && telefono.trim() && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(telefono)) {
    errores.telefono = 'Formato de teléfono inválido';
  }

  if (edad && (edad < 18 || edad > 100)) {
    errores.edad = 'La edad debe estar entre 18 y 100 años';
  }

  const paisesValidos = ['Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Perú', 'Uruguay', 'Venezuela'];
  if (pais && !paisesValidos.includes(pais)) {
    errores.pais = 'País no válido';
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errores
    });
  }

  next();
};

// GET /api/users - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'fechaCreacion', order = 'desc', search } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Construcción de query de búsqueda
    let query = {};
    if (search) {
      query = {
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { pais: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const usuarios = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await User.countDocuments(query);

    // Si es una solicitud simple sin paginación, devolver solo los datos
    if (!req.query.page && !req.query.limit) {
      return res.json(usuarios);
    }

    // Si hay parámetros de paginación, devolver respuesta completa
    res.json({
      success: true,
      data: usuarios,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener usuarios'
    });
  }
});

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    const usuario = await User.findById(id).select('-__v');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el usuario'
    });
  }
});

// POST /api/users - Crear nuevo usuario
router.post('/', validarDatosUsuario, async (req, res) => {
  try {
    const { nombre, email, telefono, edad, pais, comentarios } = req.body;

    // Verificar si el email ya existe
    const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }

    const nuevoUsuario = new User({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono?.trim() || '',
      edad: parseInt(edad),
      pais,
      comentarios: comentarios?.trim() || ''
    });

    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: usuarioGuardado._id,
        nombre: usuarioGuardado.nombre,
        email: usuarioGuardado.email,
        telefono: usuarioGuardado.telefono,
        edad: usuarioGuardado.edad,
        pais: usuarioGuardado.pais,
        comentarios: usuarioGuardado.comentarios,
        fechaCreacion: usuarioGuardado.fechaCreacion
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    if (error.name === 'ValidationError') {
      const errores = {};
      Object.keys(error.errors).forEach(key => {
        errores[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errores
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el usuario'
    });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', validarDatosUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, edad, pais, comentarios } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    // Verificar si el email ya existe en otro usuario
    if (email) {
      const usuarioExistente = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro usuario con este correo electrónico'
        });
      }
    }

    const datosActualizacion = {
      ...(nombre && { nombre: nombre.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(telefono !== undefined && { telefono: telefono.trim() }),
      ...(edad && { edad: parseInt(edad) }),
      ...(pais && { pais }),
      ...(comentarios !== undefined && { comentarios: comentarios.trim() }),
      fechaActualizacion: new Date()
    };

    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      datosActualizacion,
      { 
        new: true, 
        runValidators: true,
        select: '-__v'
      }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    if (error.name === 'ValidationError') {
      const errores = {};
      Object.keys(error.errors).forEach(key => {
        errores[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errores
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el usuario'
    });
  }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    const usuarioEliminado = await User.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: {
        id: usuarioEliminado._id,
        nombre: usuarioEliminado.nombre,
        email: usuarioEliminado.email
      }
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el usuario'
    });
  }
});

// GET /api/users/estadisticas/resumen - Obtener estadísticas
router.get('/estadisticas/resumen', async (req, res) => {
  try {
    const totalUsuarios = await User.countDocuments();
    const usuariosPorPais = await User.aggregate([
      { $group: { _id: '$pais', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const edadPromedio = await User.aggregate([
      { $group: { _id: null, promedio: { $avg: '$edad' } } }
    ]);

    const usuariosRecientes = await User.countDocuments({
      fechaCreacion: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 días
    });

    res.json({
      success: true,
      data: {
        totalUsuarios,
        usuariosPorPais,
        edadPromedio: edadPromedio[0]?.promedio || 0,
        usuariosRecientes
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
});

module.exports = router;