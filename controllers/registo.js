const Utilizadores = require('../models/utilizadores');
const { validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const mailer = require('../helpers/mailer');

exports.getRegisto = (req, res) => {
  res.render('registo');
}

exports.criarRegisto = async (req, res) => {
  const errors = validationResult(req);
  const nome = req.body.nome.trim();
  const email = req.body.email.trim();
  const password = req.body.password;

  const oldUtilizador = {
    nome: nome,
    email: email,
  };

  if (!errors.isEmpty()) {
    return res.render('registo', {
      errors: errors.array({ onlyFirstError: true }),
      utilizador: oldUtilizador,
    });
  }

  try {
    await Utilizadores.create({
      nome: nome,
      email: email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      activo: 0
    });

    const admins = await Utilizadores.findAll({
      attributes: ['email'],
      where: {
        nivel: 10,
        activo: 1,
      },
      raw: true,
    });

    const mailList = [];
    
    if(admins && admins.length > 0){
      admins.forEach((email) => mailList.push(email.email));
    }

    const envio = await mailer.enviarEmail({
      to: mailList.length > 0 ? mailList.join(', ') : process.env.EMAIL,
      subject: 'Registo na plataforma DOU - Gestão de Processos',
      text: `Novo registo de ${nome} (${email}) ao qual é necessário efectuar a activação da conta.`,
      html: `<strong>Novo Registo</strong><br><br><strong>Nome: </strong>${nome}<br><strong>Email: </strong>${email}<br><br>É necessário efectuar a activação da conta.`,
    });

    if(!envio) {
      return res.render('auth_messages', {
        type: 'success',
        title: 'Registo efectuado',
        msg: 'No entanto, não foi possível notificar os administradores do seu registo. Contacte-os para activação da sua conta',
        backPage: 'login',
      });
    }

    res.render('auth_messages', {
      type: 'success',
      title: 'Registo efectuado',
      msg: 'Os administradores foram notificados do seu registo. Receberá email quando a sua conta for activada.',
      backPage: 'login',
    });
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      const errors = [
        {
          msg: 'Utilizador já existe',
          param: 'unique',
        },
      ];
      return res.render('registo', {
        errors: errors,
        utilizador: oldUtilizador,
      });
    }

    res.render('auth_messages', {
      type: 'error',
      title: 'Erro',
      msg: 'Não foi possível notificar os administradores. Contacte os administradores para activação da sua conta.',
      backPage: 'login'
    });
  }
}