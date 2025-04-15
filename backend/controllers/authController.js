const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const { name, email, password, role = 'student' } = req.body;

      // Validar si el usuario ya existe
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear usuario
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      // Generar JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      res.status(201).json({ token, user: { id: user.id, name, email, role } });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Verificar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
};

module.exports = authController;