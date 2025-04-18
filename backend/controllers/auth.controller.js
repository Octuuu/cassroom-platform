const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');

// Registro
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificamos si ya existe un usuario con ese email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'alumno', // por defecto
    });

    // Generamos token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor.', error });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Email o contraseña incorrectos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Email o contraseña incorrectos.' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login exitoso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor.', error });
  }
};
