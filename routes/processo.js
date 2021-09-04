const router = require('express').Router();
const processoController = require('../controllers/processo');
const { body } = require('express-validator');
const { userAuthenticated } = require('../controllers/login');

router.all('/*', userAuthenticated, (req, res, next) => {
  next();
});

router.get('/:processoId', processoController.getProcesso);

router
  .route('/adicionarhistorico/:processoId')
  .get(processoController.getAdicionarHistorico)
  .post(
    [
      body('data').notEmpty().withMessage('Deve indicar a data'),
      body('historicocontent').notEmpty().withMessage('Deve indicar a descrição'),
    ],
    processoController.criarHistoricoProcesso
  );

router.get('/editarHistorico/:historicoId', processoController.getEditarHistorico);

router.post(
  '/editarHistorico/:historicoId/processo/:processoId',
  [
    body('data').notEmpty().withMessage('Deve indicar a data'),
    body('historicocontent').notEmpty().custom(value => value !== '<p><br></p>').withMessage('Deve indicar a descrição'),
  ],
  processoController.editarHistorico
);

router.delete('/eliminarHistorico/:historicoId', processoController.eliminarHistorico);

router.get('/:processoId/reactivarProcesso',processoController.reactivarProcesso);
router.get('/:processoId/suspenderProcesso', processoController.suspenderProcesso);
router.get('/:processoId/encerrarProcesso', processoController.encerrarProcesso);

router.post('/procurarHistorico/:processoId', processoController.procurarHistorico);

module.exports = router;