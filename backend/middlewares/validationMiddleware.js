const { check, validationResult } = require('express-validator');

const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(422).json({
      errors: extractedErrors
    });
  };
};

const userValidationRules = () => {
  return [
    check('firstName').not().isEmpty().withMessage('Nombre es requerido'),
    check('lastName').not().isEmpty().withMessage('Apellido es requerido'),
    check('email').isEmail().withMessage('Debe ser un email válido'),
    check('password')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
  ];
};

const courseValidationRules = () => {
  return [
    check('name').not().isEmpty().withMessage('Nombre del curso es requerido'),
    check('startDate').isDate().withMessage('Fecha de inicio inválida'),
    check('endDate').isDate().withMessage('Fecha de fin inválida')
  ];
};

module.exports = {
  validateRequest,
  userValidationRules,
  courseValidationRules
};