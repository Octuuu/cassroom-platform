const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Función principal de autenticación
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Tu cuenta está suspendida o inactiva' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    res.status(401).json({ error: 'Error de autenticación' });
  }
};

// Verificar rol de profesor
const isProfessor = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a profesores' });
  }
  next();
};

// Verificar rol de administrador
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
};

// Verificar propiedad del recurso
const isOwnerOrAdmin = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findByPk(req.params[paramName]);
      
      if (!resource) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }

      if (req.user.role === 'admin' || resource.userId === req.user.id) {
        return next();
      }

      if (model.name === 'Course' && resource.professorId === req.user.id) {
        return next();
      }

      res.status(403).json({ error: 'No tienes permiso para este recurso' });
    } catch (error) {
      console.error('Error en verificación de propiedad:', error);
      res.status(500).json({ error: 'Error al verificar permisos' });
    }
  };
};

module.exports = {
  authenticate,
  isProfessor,
  isAdmin,
  isOwnerOrAdmin
};