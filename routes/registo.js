const router = require('express').Router();
const registoController = require('../controllers/registo');
const { body } = require('express-validator');

router
  .route('/')
  .get(registoController.getRegisto)
  .post(
    [
      body('nome').notEmpty().withMessage('Deve indicar o nome'),
      body('nome').matches(/^[^0-9]+$/i).withMessage('Nome inválido'),
      body('email').notEmpty().withMessage('Deve indicar o endereço de email'),
      body('email').isEmail().withMessage('Endereço de email inválido'),
      body('password').notEmpty().withMessage('Deve indicar a password'),
      body('confirmpassword').notEmpty().withMessage('Deve confirmar a password'),
      body('confirmpassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(
            'Confirmação da password não coincide com a password'
          );
        }
        return true;
      })
    ],
    registoController.criarRegisto
  );

module.exports = router;