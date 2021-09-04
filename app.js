const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const fs = require('fs');

require('dotenv').config()

const { checkDataDirectory, readConfigFile } = require('./helpers/appPaths');

const app = express();

const config = readConfigFile();

checkDataDirectory();

// TEMPLATE VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ASSETS
app.use(express.static(path.join(__dirname, 'assets')));

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SESSIONS
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

app.use(function (req, res, next) {
    res.locals.loggedUser = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.warning = req.flash('warning');
    next();
});

// Database
const database = require('./helpers/database');

// Models
const Utilizadores = require('./models/utilizadores');
const Processos = require('./models/processos');
const Tipologias = require('./models/tipologias');
const Historico = require('./models/historico');

Tipologias.hasMany(Processos, {
  foreignKey: 'tipologiaId',
  onDelete: 'CASCADE'
});
Processos.belongsTo(Tipologias, {
    foreignKey: 'tipologiaId'
});

Utilizadores.hasMany(Processos, {
  foreignKey: 'utilizadorId',
  onDelete: 'CASCADE'
});
Processos.belongsTo(Utilizadores, {
  foreignKey: 'utilizadorId',
});

Processos.hasMany(Historico, {
  foreignKey: 'processoId',
});
Historico.belongsTo(Processos, {
    foreignKey: 'processoId'
});

Utilizadores.hasMany(Historico, {
  foreignKey: 'utilizadorId',
  onDelete: 'CASCADE'
});
Historico.belongsTo(Utilizadores, {
  foreignKey: 'utilizadorId',
});

// ROUTES
const login = require('./routes/login');
const registo = require('./routes/registo');
const index = require('./routes/index');
const admin = require('./routes/admin');
const processo = require('./routes/processo');

app.use('/login', login);
app.use('/registar', registo);
//app.use('/logout', login);
app.use('/', index);
app.use('/processo', processo);
app.use('/admin', admin);

/*app.all('*', (req, res) => {
    res.render('404');
});*/

database.sync().then(() => {
    app.listen(config.porta, () => {
        console.log(`DOU - Gestão de Processos em http://localhost:${config.porta}`);
    });
}).catch(error => {
    console.log(error);
});