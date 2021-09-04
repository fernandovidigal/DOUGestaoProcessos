const { validationResult } = require('express-validator');
const Utilizadores = require('../models/utilizadores');
const Tipologias = require('../models/tipologias');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const { readConfigFile, writeConfigFile } = require('../helpers/appPaths');
const Mailer = require('../helpers/mailer');

exports.getAdminMenu = (req, res) => {
  req.session.selectedMenu = 'gestao';
  res.locals.selectedMenu = 'gestao';
  res.render('admin/index');
};

exports.getListaTipologias = async (req, res) => {
  const listaTipologias = await Tipologias.findAll();
  res.render('admin/tipologias', {listaTipologias: listaTipologias});
}

exports.getAdicionarTipologia = (req, res) => {
  res.render('admin/adicionar_tipologia');
};

exports.getEditarTipologia = async (req, res) => {
  const tipologiaId = req.params.tipologiaId || null;

  try {
    if(tipologiaId == null) throw new Error();

    const tipologia = await Tipologias.findByPk(tipologiaId);

    if(!tipologia) throw new Error('Tipo de processo não encontrado');

    res.render('admin/editar_tipologia', {tipologia: tipologia});
  } catch(error){
    req.flash('error', 'Não foi possível obter o tipo de processo');
    res.redirect('/admin/listaTipologias');
  }
};

exports.criarTipologia = async (req, res) => {
  const errors = validationResult(req);
  const designacao = req.body.designacao;

  if(!errors.isEmpty()){
    return res.render('admin/adicionar_tipologia', {
      errors: errors.array({onlyFirstError: true}),
      oldData: {
        designacao: designacao
      }
    });
  } 

  try {
    await Tipologias.create({
      designacao: designacao
    });

    req.flash('success', 'Tipo de Processo adicionado');
    res.redirect('/admin/listaTipologias');
  } catch(error){
    req.flash('error', 'Não foi possível adicionar o tipo de processo');
    res.redirect('/admin/listaTipologias');
  }
}

exports.updateTipologia = async (req, res) => {
  const errors = validationResult(req);
  const designacao = req.body.designacao;
  const tipologiaId = req.params.tipologiaId || null;

  const oldTipologia = {
    tipologiaId: tipologiaId,
    designacao: designacao
  };

  if (!errors.isEmpty()) {
    return res.render('admin/editar_tipologia', {
      errors: errors.array({ onlyFirstError: true }),
      tipologia: oldTipologia,
    });
  }

  try {
    if(tipologiaId == null) throw new Error();

    await Tipologias.update(
      { designacao: designacao },
      { where: { tipologiaId: tipologiaId } }
    );

    req.flash('success', 'Tipo de Processo actualizado');
    res.redirect('/admin/listaTipologias');
  } catch(error){
    req.flash('error', 'Não foi possível actualizar o tipo de processo');
    res.redirect('/admin/listaTipologias');
  }
}

exports.deleteTipologia = async (req, res) => {
  const tipologiaId = req.params.tipologiaId || null;

  try {
    if (tipologiaId == null) throw new Error();

    const tipologia = await Tipologias.findByPk(tipologiaId);

    if (!tipologia) throw new Error();

    await tipologia.destroy();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(200).json({ success: false });
  }
}

exports.getUtilizadores = async (req, res) => {
  const utilizadores = await Utilizadores.findAll();
  res.render('admin/utilizadores', {utilizadores: utilizadores});
}

exports.getAdicionarUtiliziador = async (req, res) => {
  res.render('admin/adicionar_utilizador');
}

exports.criarUtilizador = async (req, res) => {
  const errors = validationResult(req);
  const nome = req.body.nome.trim();
  const email = req.body.email.trim();
  const password = req.body.password;
  const nivel = parseInt(req.body.nivel) || 1;

  const oldUtilizador = {
    nome: nome,
    email: email,
    nivel: nivel,
  };

  if (!errors.isEmpty()) {
    return res.render('admin/adicionar_utilizador', {
      errors: errors.array({ onlyFirstError: true }),
      utilizador: oldUtilizador,
    });
  }

  try {
    await Utilizadores.create({
      nome: nome,
      email: email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      nivel: nivel,
    });

    req.flash('success', 'Utilizador adicionado');
    res.redirect('/admin/utilizadores');
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      const errors = [
        {
          msg: 'Utilizador já existe',
          param: 'unique',
        },
      ];
      return res.render('adicionarUtilizador', { errors: errors, utilizador: oldUtilizador });
    }
    req.flash('error', 'Não foi possível adicionar o utilizador');
    res.redirect('/admin/utilizadores');
  }
}

exports.editarUtilizador = async (req, res) => {
  const utilizadorId = req.params.utilizadorId;

  const utilizador = await Utilizadores.findByPk(utilizadorId);

  res.render('admin/editar_utilizador', { utilizador: utilizador });
}

exports.updateUtilizador = async (req, res) => {
  const utilizadorId = req.params.utilizadorId;
  const errors = validationResult(req);
  const nome = req.body.nome.trim();
  const email = req.body.email.trim();
  const nivel = parseInt(req.body.nivel) || 1;

  const oldUtilizador = {
    utilizadorId: utilizadorId,
    nome: nome,
    email: email,
    nivel: nivel,
  };

  if (!errors.isEmpty()) {
    return res.render('admin/editar_utilizador', {
      errors: errors.array({ onlyFirstError: true }),
      utilizador: oldUtilizador
    });
  }

  try {
    const utilizadorToUpdate = await Utilizadores.findByPk(utilizadorId);
    utilizadorToUpdate.nome = nome;
    utilizadorToUpdate.email = email;
    utilizadorToUpdate.nivel = nivel;

    await utilizadorToUpdate.save();

    req.flash('success', 'Utilizador actualizado');
    res.redirect('/admin/utilizadores');
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      const errors = [
        {
          msg: 'Utilizador já existe',
          param: 'unique',
        },
      ];
      return res.render('admin/editar_utilizador', {
        errors: errors,
        user: oldUtilizador
      });
    }
    req.flash('error', 'Não foi possível actualizar o utilizador');
    res.redirect('/admin/utilizadores');
  }
}

exports.deleteUtilizador = async (req, res) => {
  const utilizadorId = parseInt(req.params.utilizadorId);

  try {
    const utilizador = await Utilizadores.findByPk(utilizadorId);

    if (utilizador) {
      utilizador.destroy();
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    res.status(200).json({ success: false });
  }
};

exports.getAlterarPassword = async (req, res) => {
  const utilizadorId = req.params.utilizadorId || null;

  try {
    if(utilizadorId == null) throw new Error();

    const utilizador = await Utilizadores.findByPk(utilizadorId);
    if(!utilizador) throw new Error();

    res.render('admin/alterar_password', {utilizador: utilizador});
  } catch (error) {
    req.flash('error', 'Não foi possível obter os dados do utilizador');
    res.redirect('/admin/utilizadores');
  }
}

exports.alterarPassword = async (req, res) => {
  const utilizadorId = req.params.utilizadorId;
  const errors = validationResult(req);
  const password = req.body.password;

  try {
    const utilizador = await Utilizadores.findByPk(utilizadorId);

    if(!utilizador) throw new Error();

    if (!errors.isEmpty()) {
      return res.render('admin/alterar_password', {
        errors: errors.array({ onlyFirstError: true }),
        utilizador: utilizador,
      });
    }

    utilizador.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    await utilizador.save();

  req.flash('success', 'Password alterada');
  res.redirect('/admin/utilizadores');
  } catch(error) {
    req.flash('error', 'Não foi possível alterar a password');
    res.redirect('/admin/utilizadores');
  }
}

exports.getServidorInfo = (req, res) => {
  const serverInfo = readConfigFile();

  res.render('admin/servidor', {server: serverInfo});
}

exports.setServidorInfo = (req, res) => {
  const errors = validationResult(req);
  const porta = req.body.porta;

  const oldServerInfo = {
    porta: porta
  }

  if(!errors.isEmpty()){
    res.render('admin/servidor', { errors: errors.array({onlyFirstError: true}), server: oldServerInfo });
  }

  if(writeConfigFile({porta: porta})){
    req.flash('success', 'Dados de configuração guardados. Serão aplicados da próxima vez que reiniciar o servidor');
    res.redirect('/admin');
  } else {
    req.flash('error', 'Não foi possível guardar os dados de configuração');
    res.redirect('/admin');
  }
}

exports.alterarEstadoUtilizador = async (req, res) => {
  const utilizadorId = req.params.utilizadorId;

  try {
    const utilizador = await Utilizadores.findByPk(utilizadorId);
    if(!utilizador) throw new Error();

    const novoEstado = 1 - utilizador.activo;

    utilizador.activo = novoEstado;
    await utilizador.save();

    if(novoEstado == 1){
      Mailer.enviarEmail({
        to: utilizador.email,
        subject: 'Activação de Registo',
        text:
          'O seu registo foi activado. Já pode utilizar a plataforma DOU - Gestão de Processos',
        msg:
          'O seu registo foi activado. Já pode utilizar a plataforma <strong>DOU - Gestão de Processos</strong>',
      });
    } else {
      Mailer.enviarEmail({
        to: utilizador.email,
        subject: 'Activação de Registo',
        text: 'O seu registo foi desactivado na plataforma DOU - Gestão de Processos',
        msg: 'O seu registo foi desactivado na plataforma <strong>DOU - Gestão de Processos</strong>',
      });
    }

    req.flash('success', 'Estado do utilizador alterado');
    res.redirect('/admin/utilizadores');
  } catch(error){
    req.flash('error', 'Não foi possível alterar o estado do utilizador');
    res.redirect('/admin/utilizadores');
  }
}