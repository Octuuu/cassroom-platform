const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Course } = require('../models');
const { Op } = require('sequelize');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const userController = {
  // Registrar nuevo usuario
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password, role = 'student' } = req.body;

      // Validar campos requeridos
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear usuario
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role
      });

      // Generar token JWT (sin password en el payload)
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validar campos
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Actualizar último login
      await user.update({ lastLogin: new Date() });

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Course,
            as: 'taughtCourses',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Course,
            as: 'enrolledCourses',
            attributes: ['id', 'name', 'code'],
            through: { attributes: ['enrollmentDate'] }
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  // Actualizar perfil de usuario
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, email, currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Validar email si se cambió
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
        user.email = email;
      }

      // Actualizar campos básicos
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      // Cambiar contraseña si se proporcionó la actual
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }

      await user.save();

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  },

  // Obtener todos los usuarios (solo admin)
  getAllUsers: async (req, res) => {
    try {
      // Verificar rol de admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        users: rows
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  // Obtener un usuario por ID (solo admin/profesor)
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      // Solo admin o el propio usuario puede ver el perfil completo
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Course,
            as: 'taughtCourses',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Course,
            as: 'enrolledCourses',
            attributes: ['id', 'name', 'code'],
            through: { attributes: ['enrollmentDate'] }
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  },

  // Actualizar usuario (solo admin)
  updateUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const { id } = req.params;
      const { firstName, lastName, email, role, status } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Validar email si se cambió
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
        user.email = email;
      }

      // Actualizar campos
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (role) user.role = role;
      if (status) user.status = status;

      await user.save();

      res.json({
        message: 'Usuario actualizado exitosamente',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  },

  // Eliminar usuario (solo admin)
  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // No permitir eliminar usuarios con cursos asignados
      const taughtCourses = await user.countTaughtCourses();
      if (taughtCourses > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar un profesor con cursos asignados' 
        });
      }

      await user.destroy();

      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  },

  // Subir/actualizar foto de perfil
  uploadProfilePicture: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Debe subir una imagen' });
      }

      const userId = req.user.id;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Eliminar imagen anterior si existe
      if (user.profilePicture) {
        const oldImagePath = path.join(__dirname, '../storage/profiles', user.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Guardar solo el nombre del archivo en la base de datos
      user.profilePicture = req.file.filename;
      await user.save();

      res.json({ 
        message: 'Foto de perfil actualizada',
        profilePicture: `/profiles/${req.file.filename}`
      });
    } catch (error) {
      console.error('Error al subir foto de perfil:', error);
      res.status(500).json({ error: 'Error al subir foto de perfil' });
    }
  }
};

module.exports = userController;