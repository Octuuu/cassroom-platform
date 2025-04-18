const { User } = require('../models');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario.', error });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    user.name = name || user.name;
    user.role = role || user.role;

    await user.save();

    res.json({ message: 'Usuario actualizado correctamente.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario.', error });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario.', error });
  }
};
