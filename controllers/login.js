const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Utilizadores = require('../models/utilizadores');
const Mailer = require('../helpers/mailer');

const godUser = {
  utilizadorId: 0,
  nome: 'Gestor',
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  nivel: 10,
  activo: 1,
};

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {

        if(email == godUser.email && password == godUser.password) {
            return done(null, godUser);
        }

        const user = await Utilizadores.findOne({
            where: { email: email, activo: 1 }
        });

        if(!user){
            return done(null, false);
        }

        bcrypt.compare(password, user.password, (err, matched) => {
            return matched ? done(null, user) : done(null, false);
        });
    }
));

passport.serializeUser(function(user, done){
    done(null, user.utilizadorId);
})

passport.deserializeUser(function(id, done){
    if(id == 0) return done(null, godUser);
        
    Utilizadores.findByPk(id)
        .then((user) => {
            done(null, user);
        })
        .catch(() => {
            done(null, false);
        });
});

exports.loginPage = (req, res) => {
    res.render('login');
}

exports.login = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()){
        return res.render('login', { errors: errors.array({ onlyFirstError: true }) });
    }

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: 'Dados de login inválidos',
    })(req, res, next);
}

exports.userAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}

exports.registar = async (req, res) => {
  res.render('registo');
};

exports.getRecuperarPassword = (req, res) => {
  res.render('recuperar_password');
};

exports.recuperarPassword = async (req, res) => {
    const errors = validationResult(req);
    const email = req.body.email.trim();

    if (!errors.isEmpty()) {
      return res.render('recuperar_password', {
        email: email,
        errors: errors.array({ onlyFirstError: true }),
      });
    }

    const chars = ['A','b','F','s','Z','z','Q','u','2','6','k','T','9','e','V','0','5','1','H','j','J','w','L','7','4','8','a','m','C','R','p','y','E','f', '3'];

    try {
        const utilizador = await Utilizadores.findOne({where: { email: email }});
        if(!utilizador) throw new Error();

        let newPassword = '';
        for(i = 0; i < 10; i++){
            const charIndex = Math.floor(Math.random() * chars.length);
            newPassword += chars[charIndex];
        }

        utilizador.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10)),
        utilizador.save();

        await Mailer.enviarEmail({
          to: utilizador.email,
          subject: 'Recuperação de Password',
          text: `A sua nova password é ${newPassword}`,
          message: `<strong>Recuperação de Password</strong><br><br><p>A sua nova password é ${newPassword}</p>`,
        });
        
        res.render('auth_messages', {
            type: 'success',
            title: 'Recuperação de password efectuada',
            msg: 'Foi enviado email com a sua nova password',
            backPage: 'login'
        });
    } catch(error){
        res.render('auth_messages', {
          type: 'error',
          title: 'Erro',
          msg: 'Não foi possível recuperar a password',
          backPage: 'login/recuperarpassword',
        });
    }
}

exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/login');
}