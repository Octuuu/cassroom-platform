const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const { Op } = require('sequelize');

module.exports = {
  // Generar token aleatorio
  generateRandomToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Formatear fechas
  formatDate: (date, format = 'YYYY-MM-DD HH:mm') => {
    return moment(date).format(format);
  },

  // Eliminar archivo del sistema
  deleteFile: (filePath) => {
    const fullPath = path.join(__dirname, '../storage', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  },

  // Validar roles
  hasRole: (user, requiredRoles) => {
    return requiredRoles.includes(user.role);
  },

  // Paginación para consultas
  paginate: (query, { page = 1, pageSize = 10 }) => {
    const offset = (page - 1) * pageSize;
    return {
      ...query,
      offset,
      limit: pageSize
    };
  },

  // Filtro de búsqueda
  buildSearchQuery: (fields, searchTerm) => {
    if (!searchTerm) return {};
    
    return {
      [Op.or]: fields.map(field => ({
        [field]: { [Op.iLike]: `%${searchTerm}%` }
      }))
    };
  },

  // Calcular progreso (para tareas/cursos)
  calculateProgress: (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  // Slugify para URLs amigables
  slugify: (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
};