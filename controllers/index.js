const { validationResult } = require('express-validator');
const Processos = require('../models/processos');
const Tipologias = require('../models/tipologias');
const { Op } = require('sequelize');
const Utilizadores = require('../models/utilizadores');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');

exports.getListaProcessos = async (req, res) => {
  const listaProcessos = await Processos.findAll({
    where: { estado: { [Op.ne]: 0 } },
    include: Tipologias,
    order: [['dataAbertura', 'DESC']],
  });

  req.session.selectedMenu = 'processos';
  res.locals.selectedMenu = 'processos';
  res.render('index', { processos: listaProcessos});
};

exports.getListaProcessosArquivados = async (req, res) => {
  const listaProcessos = await Processos.findAll({
    where: {
      estado: 0,
    },
    include: Tipologias,
    order: [['dataAbertura', 'DESC']],
  });

  req.session.selectedMenu = 'arquivo';
  res.locals.selectedMenu = 'arquivo';
  res.render('index', { processos: listaProcessos });
};

exports.getAdicionarProcesso = async (req, res) => {
  try {
    const tipologias = await Tipologias.findAll();

    res.render('adicionar_processo', { tipologias: tipologias });
  } catch(error){
    req.flash('error', 'Não foi possivel obter os tipos de processo');
    req.redirect('/');
  }
}

exports.criarProcesso = async (req, res) => {
  const errors = validationResult(req);
  const referencia = req.body.referencia || null;
  const naoaplicavel = req.body.referencianaoaplicavel || null;
  const designacao = req.body.designacao;
  const tipoprocesso = req.body.tipoprocesso;
  const data = req.body.data;

  const erros = errors.array({ onlyFirstError: true });

  if(referencia == null && naoaplicavel == null){
    erros.push({
      value: '',
      msg: 'Deve indicar a referência ou selecionar não aplicável',
      param: 'referencia',
      location: 'body'
    });
  }

  const oldProcesso = {
    data: data,
    referencia: referencia,
    naoaplicavel: naoaplicavel,
    designacao: designacao,
    tipoprocesso: tipoprocesso,
  };

  const tipologias = await Tipologias.findAll();

  if(erros.length > 0){
    return res.render('adicionar_processo', {
      tipologias: tipologias,
      errors: erros,
      processo: oldProcesso
    });
  }

  try {
    if(referencia != null){
      const processo = await Processos.findOne({
        where: { referencia: referencia },
      });

      if(processo){
        erros.push({
          value: referencia,
          msg: 'Já existe um processo com esta referência',
          param: 'referencia',
          location: 'body',
        });
        return res.render('adicionar_processo', {
          tipologias: tipologias,
          errors: erros,
          processo: oldProcesso,
        });
      }
    }

    const [dia, mes, ano] = data.split('/');
    const newDate = new Date();
    newDate.setDate(dia);
    newDate.setMonth(mes - 1);
    newDate.setFullYear(ano);
    
    await Processos.create({
      tipologiaId: tipoprocesso,
      utilizadorId: req.user.utilizadorId,
      referencia: referencia,
      designacao: designacao,
      dataAbertura: newDate
    });

    req.flash('success', 'Processo adicionado');
    res.redirect('/');
  } catch(error) {
    req.flash('error', 'Não foi possível adicionar o processo');
    res.redirect('/');
  }
}

exports.getEditarProcesso = async (req, res) => {
  const processoId = req.params.processoId;

  try {
    const _tipologias = Tipologias.findAll();
    const _processo = Processos.findByPk(processoId);
    const [tipologias, processo] = await Promise.all([_tipologias, _processo]);

    if(!processo){
      throw new Error();
    }

    processo.naoaplicavel = 'on';

    res.render('editar_processo', { processo: processo, tipologias: tipologias });
  } catch(error) {
    req.flash('error', 'Não foi possivel obter o processo');
    req.redirect('/');
  }
}

exports.actualizarProcesso = async (req, res) => {
  const processoId = req.params.processoId;
  const errors = validationResult(req);
  const referencia = req.body.referencia || null;
  const naoaplicavel = req.body.referencianaoaplicavel || null;
  const designacao = req.body.designacao;
  const tipoprocesso = req.body.tipoprocesso;
  const data = req.body.data;

  const erros = errors.array({ onlyFirstError: true });

  const oldProcesso = {
    dataAbertura: data,
    processoId: processoId,
    referencia: referencia,
    naoaplicavel: naoaplicavel,
    designacao: designacao,
    tipoprocesso: tipoprocesso,
  };

  try {
    const _tipologias = Tipologias.findAll();
    const _processo = Processos.findByPk(processoId);
    const [tipologias, processo] = await Promise.all([_tipologias, _processo]);

    if (referencia == null && naoaplicavel == null) {
      erros.push({
        value: '',
        msg: 'Deve indicar a referência ou selecionar não aplicável',
        param: 'referencia',
        location: 'body',
      });
    }

    if (erros.length > 0) {
      return res.render('editar_processo', {
        tipologias: tipologias,
        errors: erros,
        processo: oldProcesso,
      });
    }

    if (referencia != null && processo.referencia != referencia) {
      const processoReferencia = Processos.findOne({
        where: { referencia: referencia },
      });

      if (processoReferencia) {
        erros.push({
          value: referencia,
          msg: 'Já existe um processo com esta referência',
          param: 'referencia',
          location: 'body',
        });
        return res.render('editar_processo', {
          tipologias: tipologias,
          errors: erros,
          processo: oldProcesso,
        });
      }
    }

    const [dia, mes, ano] = data.split('/');
    const newDate = new Date();
    newDate.setDate(dia);
    newDate.setMonth(mes - 1);
    newDate.setFullYear(ano);

    processo.dataAbertura = newDate;
    processo.tipologiaId = tipoprocesso;
    processo.referencia = referencia;
    processo.designacao = designacao;

    await processo.save();

    req.flash('success', 'Processo actualizado');
    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Não foi possível actualizar o processo');
    res.redirect('/');
  }
}

exports.eliminarProcesso = async (req, res) => {
  const processoId = req.params.processoId || null;

  try {
    if(processoId == null) throw new Error();

    const processo = await Processos.findByPk(processoId);
    if(!processo) throw new Error();

    await processo.destroy();
    return res.status(200).json({ success: true });
  } catch(error) {
    return res.status(200).json({ success: false });
  }
}

exports.search = async (req, res) => {
  const termos = req.body.searchterms;

  try {
    const processos = await Processos.findAll({
      where: {
        estado: { [Op.ne]: 0 },
        [Op.or]: [
          {
            referencia: { [Op.substring]: termos }
          },
          {
            designacao: { [Op.substring]: termos }
          },
        ],
      },
      include: Tipologias,
    });

    res.render('index', { processos: processos, termos: termos });
  } catch(error) {
    req.flash('error', 'Não foi possível efectuar a pesquisa');
    res.redirect('/');
  }
}

exports.getDefinicoes = async (req, res) => {
  req.session.selectedMenu = 'definicoes';
  res.locals.selectedMenu = 'definicoes';
  res.render('definicoes');
}

exports.getAlterarPerfil = async (req, res) => {
  res.render('alterar_perfil', {utilizador: req.user});
}

exports.alterarPerfil = async (req, res) => {
  const errors = validationResult(req);
  const nome = req.body.nome.trim();
  const email = req.body.email.trim();

  const oldUtilizador = {
    nome: nome,
    email: email
  }

  if (!errors.isEmpty()) {
    return res.render('alterar_perfil', { errors: errors.array({onlyFirstError:true}), utilizador: oldUtilizador });
  }

  try {
    const utilizador = await Utilizadores.findByPk(req.user.utilizadorId);

    utilizador.nome = nome;
    utilizador.email = email;
    await utilizador.save();
    
    req.flash('success', 'Perfil actualizado');
    res.redirect('/definicoes');
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      const errors = [
        {
          msg: 'Endereço de email já está em uso',
          param: 'unique',
        },
      ];
      return res.render('alterar_perfil', { errors: errors, utilizador: oldUtilizador });
    }

    req.flash('error', 'Não foi possível actualizar o perfil');
    res.redirect('/definicoes');
  }
}

exports.getAlterarPassword = async (req, res) => {
  res.render('alterar_password');
}

exports.alterarPassword = async (req, res) => {
  const errors = validationResult(req);
  const passwordActual = req.body.passwordActual;
  const password = req.body.password;
  const erros = errors.array({ onlyFirstError: true });

  const result = await bcrypt.compare(passwordActual, req.user.password);
  if(!result){
    erros.push({
      value: '',
      msg: 'Password actual incorrecta',
      param: 'passwordActual',
      location: 'passwordActual',
    });
  }

  if (erros.length > 0) {
    return res.render('alterar_password', { errors: erros });
  }

  try {
    const utilizador = await Utilizadores.findByPk(req.user.utilizadorId);

    if(!utilizador) throw new Error();

    utilizador.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    await utilizador.save();

    req.flash('success', 'Password alterada');
    res.redirect('/definicoes');
  } catch(error) {
    req.flash('error', 'Não foi possível alterar a passord');
    res.redirect('/definicoes');
  }
}

exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
}