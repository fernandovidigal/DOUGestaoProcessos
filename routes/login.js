const router = require('express').Router();
const loginController = require('../controllers/login');
const { body } = require('express-validator');

router.get('/', loginController.loginPage);

router.post(
  '/',
  [
    body('email').notEmpty().withMessage('Deve indicar o email'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Deve indicar a password'),
  ],
  loginController.login
);

router.get('/registar', loginController.registar);

router
  .route('/recuperarpassword')
  .get(loginController.getRecuperarPassword)
  .post(
    [
    body('email').notEmpty().withMessage('Deve indicar o email'),
    body('email').isEmail().withMessage('Email inválido')
    ]
    , loginController.recuperarPassword);

//router.get('/logout', loginController.logout);

module.exports = router;