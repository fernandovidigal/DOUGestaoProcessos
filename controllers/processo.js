const Processos = require('../models/processos');
const Tipologias = require('../models/tipologias');
const Historico = require('../models/historico');
const Utilizadores = require('../models/utilizadores');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getProcesso = async (processoId) => {
  const processo = await Processos.findAll({
    where: {
      processoId: processoId,
    },
    include: [{ model: Tipologias }],
  });

  return processo[0];
}

exports.getProcesso = async (req, res) => {
  const processoId = req.params.processoId || null;

  try {
    if(processoId == null){
      throw new Error();
    }

    const processo = await Processos.findAll({
      where: {
        processoId: processoId,
      },
      include: [
        { model: Tipologias },
        { 
          model: Historico,
          include: Utilizadores
        }
      ],
      order: [[Historico, 'data', 'DESC']],
    });
    
    res.render('processo', { processo: processo[0] });
  } catch (error) {
    req.flash("error", "Não foi possível obter o processo");
    res.redirect('/');
  }
}

exports.reactivarProcesso = async (req, res) => {
  const processoId = req.params.processoId || null;

  try {
    if (processoId == null) throw new Error();

    const processo = await Processos.findByPk(processoId);
    if (!processo) throw new Error();

    processo.estado = 1;
    await processo.save();

    await Historico.create({
      processoId: processoId,
      utilizadorId: req.user.utilizadorId,
      descricao: `Processo <strong>reactivado</strong> por ${req.user.nome}`,
    });

    req.flash('success', 'Processo reactivado');
    res.redirect(`/processo/${processoId}`);
  } catch (error) {
    req.flash('error', 'Não foi possível reactivar o processo');
    res.redirect(processoId != null ? `/processo/${processoId}` : '/');
  }
};

exports.suspenderProcesso = async (req, res) => {
  const processoId = req.params.processoId || null;

  try {
    if (processoId == null) throw new Error();

    const processo = await Processos.findByPk(processoId);
    if(!processo) throw new Error();

    processo.estado = 2;
    await processo.save();

    await Historico.create({
      processoId: processoId,
      utilizadorId: req.user.utilizadorId,
      descricao: `Processo <strong>suspenso</strong> por ${req.user.nome}`,
    });

    req.flash('success', 'Processo suspenso');
    res.redirect(`/processo/${processoId}`);
  } catch (error){
    req.flash("error", "Não foi possível suspender o processo");
    res.redirect(processoId != null ? `/processo/${processoId}` : '/');
  }
}

exports.encerrarProcesso = async (req, res) => {
  const processoId = req.params.processoId || null;

  try {
    if (processoId == null) throw new Error();

    const processo = await Processos.findByPk(processoId);
    if (!processo) throw new Error();

    processo.estado = 0;
    await processo.save();

    await Historico.create({
      processoId: processoId,
      utilizadorId: req.user.utilizadorId,
      descricao: `Processo <strong>encerrado</strong> por ${req.user.nome}`,
    });

    req.flash('success', 'Processo encerrado');
    res.redirect(`/processo/${processoId}`);
  } catch (error) {
    req.flash('error', 'Não foi possível encerrar o processo');
    res.redirect(processoId != null ? `/processo/${processoId}` : '/');
  }
}

exports.getAdicionarHistorico = async (req, res) => {
  const processoId = req.params.processoId || null;

  if (processoId == null) {
    req.flash('error', 'Não foi possível obter o processo');
    return res.redirect('/');
  }

  try {
    const processo = await Processos.findAll({
      where: {
        processoId: processoId,
      },
      include: [{ model: Tipologias }],
    });

    res.render('adicionar_historico', { processo: processo[0] });
  } catch (error) {
    req.flash("error", "Não foi possível obter o processo");
    res.redirect(`/processo/${processoId}`);
  }
}

exports.criarHistoricoProcesso = async (req, res) => {
  const descricao = req.body.historicocontent;
  const processoId = req.params.processoId || null;
  const userId = req.user.utilizadorId;
  const data = req.body.data;
  const errors = validationResult(req);

  if (processoId == null) {
    req.flash('error', 'Não foi possível obter o processo');
    return res.redirect('/');
  }

  const processo = await Processos.findAll({
    where: {
      processoId: processoId,
    },
    include: [{ model: Tipologias }],
  });

  if(!processo){
    req.flash('error', 'Não foi possível obter o processo');
    return res.redirect('/');
  }

  if (!errors.isEmpty()) {
    return res.render('adicionar_historico', {
      errors: errors.array({ onlyFirstError: true }),
      oldHistorico: {
        data: data,
        descricao: descricao,
      },
      processo: processo[0]
    });
  }

  try {
    const [dia, mes, ano] = data.split('/');
    const newDate = new Date();
    newDate.setDate(dia);
    newDate.setMonth((mes-1));
    newDate.setFullYear(ano);

    await Historico.create({
      processoId: processoId,
      utilizadorId: userId,
      data: newDate,
      descricao: descricao,
    });

    req.flash('success', 'Histório adicionado');
    res.redirect(`/processo/${processoId}`);
  } catch(error) {
    req.flash('error', 'Não foi possível adicionar histórico ao processo');
    return res.redirect(`/processo/${processoId}`);
  }
}

exports.getEditarHistorico = async (req, res) => {
  const historicoId = req.params.historicoId;
  
  try {
    const historico = await Historico.findByPk(historicoId);
    if (!historico) throw new Error();

    const processo = await getProcesso(historico.processoId);

    res.render('editar_historico', {processo: processo, historico: historico});
  } catch(error) {
    req.flash('error', 'Não foi possível obter o processo');
    return res.redirect('/');
  }
}

exports.editarHistorico = async (req, res) => {
  const historicoId = req.params.historicoId;
  const processoId = req.params.processoId;
  const descricao = req.body.historicocontent;
  const data = req.body.data;
  const errors = validationResult(req);

  const oldHistorico = {
    historicoId: historicoId,
    data: data,
    descricao: descricao
  }

  try {
    const _historico = Historico.findByPk(historicoId);
    const _processo = getProcesso(processoId);
    const [historico, processo] = await Promise.all([_historico, _processo]);

    if(!historico || !processo) throw new Error();

    if (!errors.isEmpty()) {
      res.render('editar_historico', {
        errors: errors.array({ onlyFirstError: true }),
        oldHistorico: oldHistorico,
        processo: processo,
      });
    }

    const [dia, mes, ano] = data.split('/');
    const newDate = new Date();
    newDate.setDate(dia);
    newDate.setMonth((mes-1));
    newDate.setFullYear(ano);

    historico.data = newDate;
    historico.descricao = descricao;
    await historico.save();

    req.flash('success', 'Histório actualizado');
    res.redirect(`/processo/${processoId}`);
  } catch(error){
    req.flash('error', 'Não foi possível editar histórico do processo');
    return res.redirect(`/processo/${processoId}`);
  }
}

exports.eliminarHistorico = async (req, res) => {
  const historicoId = req.params.historicoId || null;

  try {
    if(historicoId == null) throw new Error();

    const historico = await Historico.findByPk(historicoId);

    if(!historico) throw new Error();

    await historico.destroy();
    return res.status(200).json({ success: true });
  } catch (error){
    return res.status(200).json({ success: false });
  }
}

exports.procurarHistorico = async (req, res) => {
  const termos = req.body.searchterms;
  const processoId = req.params.processoId;

  try {
    const processo = await Processos.findAll({
      where: {
        processoId: processoId,
      },
      include: [
        { model: Tipologias },
        {
          model: Historico,
          where: {
            descricao: { [Op.substring]: termos },
          },
          include: Utilizadores,
        },
      ],
      order: [[Historico, 'data', 'DESC']],
    });

    if(!processo || !processo.length ){
      const apenasProcesso = await getProcesso(processoId);

      if(!apenasProcesso) throw new Error();

      return res.render('processo', {processo: apenasProcesso, noHistorico: true, termos: termos});
    }

    res.render('processo', { processo: processo[0], termos: termos });
  } catch (error) {
    req.flash('error', 'Não foi possível efectuar a pesquisa');
    res.redirect('/');
  }
};
