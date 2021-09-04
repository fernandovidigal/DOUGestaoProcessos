const router = require('express').Router();
const adminController = require('../controllers/admin');
const { body } = require('express-validator');
const { userAuthenticated } = require('../controllers/login');

router.all('/*', userAuthenticated, (req, res, next) => {
  res.locals.selectedMenu = req.session.selectedMenu;
  if(req.user.nivel != 10) {
    res.redirect('/');
  }
  next();
});

router.get('/', adminController.getAdminMenu);

router.get('/listaTipologias', adminController.getListaTipologias);

router.get('/adicionarTipologia', adminController.getAdicionarTipologia);

router.get('/editarTipologia/:tipologiaId', adminController.getEditarTipologia);

router.post(
  '/criarTipologia',
  [
    body('designacao')
      .notEmpty()
      .withMessage('Deve indicar a designação do tipo de processo'),
  ],
  adminController.criarTipologia
);

router.post(
  '/updateTipologia/:tipologiaId',
  [
    body('designacao')
      .notEmpty()
      .withMessage('Deve indicar a designação do tipo de processo'),
  ],
  adminController.updateTipologia
);

router.delete('/deleteTipologia/:tipologiaId', adminController.deleteTipologia);

router.get('/utilizadores', adminController.getUtilizadores);
router.get('/adicionarUtilizador', adminController.getAdicionarUtiliziador);
router.get('/editarUtilizador/:utilizadorId', adminController.editarUtilizador);

router.post(
  '/criarUtilizador',
  [
    body('nome').notEmpty().withMessage('Deve indicar o nome'),
    body('nome')
      .matches(/^[^0-9]+$/i)
      .withMessage('Nome inválido'),
    body('email').notEmpty().withMessage('Deve indicar o endereço de email'),
    body('email').isEmail().withMessage('Endereço de email inválido'),
    body('password').notEmpty().withMessage('Deve indicar a password'),
    body('confirmPassword').notEmpty().withMessage('Deve confirmar a password'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirmação da password não coincide com a password');
      }
      return true;
    }),
    body('nivel').isIn(['1', '10']).withMessage('Nível inválido'),
  ],
  adminController.criarUtilizador
);

router.post(
  '/updateUtilizador/:utilizadorId',
  [
    body('nome').notEmpty().withMessage('Deve indicar o nome'),
    body('nome')
      .matches(/^[^0-9]+$/i)
      .withMessage('Nome inválido'),
    body('email').notEmpty().withMessage('Deve indicar o endereço de email'),
    body('email').isEmail().withMessage('Endereço de email inválido'),
    body('nivel').isIn(['1', '10']).withMessage('Nível inválido'),
  ],
  adminController.updateUtilizador
);

router.delete('/deleteUtilizador/:utilizadorId', adminController.deleteUtilizador);

router
  .route('/alterarPassword/:utilizadorId')
  .get(adminController.getAlterarPassword)
  .post([
    body('password').notEmpty().withMessage('Deve indicar a nova password'),
    body('confirmPassword').notEmpty().withMessage('Deve confirmar a nova password'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirmação da nova password não coincide com a nova password');
      }
      return true;
    }),
  ], adminController.alterarPassword);

router
  .route('/servidor')
  .get(adminController.getServidorInfo)
  .post(
    [
      body('porta').notEmpty().withMessage('Deve indicar a porta'),
      body('porta').isNumeric().withMessage('Porta inválida')
    ],
    adminController.setServidorInfo
  );

router.get('/alterarEstadoUtilizador/:utilizadorId', adminController.alterarEstadoUtilizador);

module.exports = router;
