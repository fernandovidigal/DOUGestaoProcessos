const router = require('express').Router();
const indexController = require('../controllers/index');
const { body } = require('express-validator');
const { userAuthenticated } = require('../controllers/login');

router.all('/*', userAuthenticated, (req, res, next) => {
  res.locals.selectedMenu = req.session.selectedMenu || 'processos';
  next();
});

router.get('/', indexController.getListaProcessos);

router.get('/adicionarProcesso', indexController.getAdicionarProcesso);

router.post(
  '/criarProcesso',
  [
    body('designacao').notEmpty().withMessage('Deve indicar a designação'),
  ],
  indexController.criarProcesso
);

router
  .route('/editarProcesso/:processoId')
  .get(indexController.getEditarProcesso)
  .post(
    [
      body('designacao').notEmpty().withMessage('Deve indicar a designação')
    ],
    indexController.actualizarProcesso
  );

router.delete('/eliminarProcesso/:processoId', indexController.eliminarProcesso);

router.get('/arquivo', indexController.getListaProcessosArquivados);

router.post('/procurar', indexController.search);

router.get('/definicoes', indexController.getDefinicoes);

router
  .route('/alterarPerfil')
  .get(indexController.getAlterarPerfil)
  .post(
    [
      body('nome').notEmpty().withMessage('Deve indicar o nome'),
      body('nome').matches(/^[^0-9]+$/i).withMessage('Nome inválido'),
      body('email').notEmpty().withMessage('Deve indicar o endereço de email'),
      body('email').isEmail().withMessage('Endereço de email inválido'),
    ],
    indexController.alterarPerfil
  );

router
  .route('/alterarPassword')
  .get(indexController.getAlterarPassword)
  .post(
    [
      body('passwordActual').notEmpty().withMessage('Deve indicar a password actual'),
      body('password').notEmpty().withMessage('Deve indicar a nova password'),
      body('confirmPassword').notEmpty().withMessage('Deve confirmar a nova password'),
      body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(
            'Confirmação da nova password não coincide com a nova password'
          );
        }
        return true;
      }),
    ],
    indexController.alterarPassword
  );

router.get('/logout', indexController.logout);

module.exports = router;
