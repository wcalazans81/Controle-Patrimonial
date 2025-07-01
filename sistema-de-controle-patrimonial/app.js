require('dotenv').config();

// Core
const express = require('express');
const http = require('http');

const path = require('path');
const { Server } = require('socket.io');
const socketUtils = require('./utils/socket'); // <- NOVO

// Middleware e utilitários
const fileupload = require('express-fileupload');
const session = require('express-session');
const useragent = require('express-useragent');
const exphbs = require('express-handlebars');
const moment = require('moment');
moment.locale('pt-br');

// Inicialização
const app = express();
const server = http.createServer(app);
const io = new Server(server);
socketUtils.setIO(io); // registra globalmente o io

// E-mail teste
const mailer = require('./utils/mailer');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
app.get('/teste-email', async (req, res) => {
  try {
    await mailer.sendMail({
      from: `"Sistema AFFEMG" <${process.env.EMAIL_USER}>`,
      to: 'destino@exemplo.com', // Altere para seu e-mail
      subject: 'Teste de envio de email',
      text: 'Este é um email de teste enviado pelo sistema.',
    });
    res.send('Email enviado com sucesso!');
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    res.status(500).send('Falha ao enviar email.');
  }
});

// Middleware - requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileupload());
app.use(useragent.express());

// Sessão
app.use(session({
  secret: 'sua_chave_supersecreta_aqui',
  resave: false,
  saveUninitialized: false,
}));

// Mensagens de sessão para as views
app.use((req, res, next) => {
  res.locals.success_msg = req.session.success_msg || null;
  res.locals.error_msg = req.session.error_msg || null;
  delete req.session.success_msg;
  delete req.session.error_msg;
  next();
});

// Usuário logado disponível em todas as views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Handlebars + helpers
const hbs = exphbs.create({
  helpers: {
    formatDate: (data) => {
      if (!data) return '';
      return moment(data).format('DD/MM/YYYY HH:mm:ss');
    }
  },
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  defaultLayout: 'main',
  extname: '.handlebars'
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', true); // Para IP real atrás de proxy

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Banco de dados
const conexao = require('./db.js');

// Middlewares de autenticação
function checarAutenticacao(req, res, next) {
  if (req.session.user) {
    return next(); // se estiver logado, prossegue
  }
  return res.redirect('/login'); // se não, manda pro login
}

// Rotas
const conPatrimonio_00 = require('./controllers/conPatrimonio_00');
const conPatrimonio_01 = require('./controllers/conPatrimonio_01');
const conPatrimonio_02 = require('./controllers/conPatrimonio_02');
const conPatrimonio_03 = require('./controllers/conPatrimonio_03');
const conPatrimonio_04 = require('./controllers/conPatrimonio_04');
const conPatrimonio_05 = require('./controllers/conPatrimonio_05');
const conPatrimonio_06 = require('./controllers/conPatrimonio_06');
const conPatrimonio_07 = require('./controllers/conPatrimonio_07');
const conPatrimonio_08 = require('./controllers/conPatrimonio_08');
const conPatrimonio_09 = require('./controllers/conPatrimonio_09');
const conPatrimonio_10 = require('./controllers/conPatrimonio_10');
const conPatrimonio_11 = require('./controllers/conPatrimonio_11');
const conPatrimonio_12 = require('./controllers/conPatrimonio_12');

const patrimonioRouter = require('./routers/patrimonioRouter.js');
const patrimonio_00Router = require('./routers/patrimonio_00Router');
const patrimonio_01Router = require('./routers/patrimonio_01Router');
const patrimonio_02Router = require('./routers/patrimonio_02Router');
const patrimonio_03Router = require('./routers/patrimonio_03Router');
const patrimonio_04Router = require('./routers/patrimonio_04Router');
const patrimonio_05Router = require('./routers/patrimonio_05Router');
const patrimonio_06Router = require('./routers/patrimonio_06Router');
const patrimonio_07Router = require('./routers/patrimonio_07Router');
const patrimonio_08Router = require('./routers/patrimonio_08Router');
const patrimonio_09Router = require('./routers/patrimonio_09Router');
const patrimonio_10Router = require('./routers/patrimonio_10Router');
const patrimonio_11Router = require('./routers/patrimonio_11Router');
const patrimonio_12Router = require('./routers/patrimonio_12Router');
const patrimonioEditarRouter = require('./routers/patrimonioEditarRouter');
const patrimonioEditarRouter_01 = require('./routers/patrimonioEditarRouter_01');
const patrimonioEditarRouter_02 = require('./routers/patrimonioEditarRouter_02');
const patrimonioEditarRouter_03 = require('./routers/patrimonioEditarRouter_03');
const patrimonioEditarRouter_04 = require('./routers/patrimonioEditarRouter_04');
const patrimonioEditarRouter_05 = require('./routers/patrimonioEditarRouter_05');
const patrimonioEditarRouter_06 = require('./routers/patrimonioEditarRouter_06');
const patrimonioEditarRouter_07 = require('./routers/patrimonioEditarRouter_07');
const patrimonioEditarRouter_08 = require('./routers/patrimonioEditarRouter_08');
const patrimonioEditarRouter_09 = require('./routers/patrimonioEditarRouter_09');
const patrimonioEditarRouter_10 = require('./routers/patrimonioEditarRouter_10');
const patrimonioEditarRouter_11 = require('./routers/patrimonioEditarRouter_11');
const patrimonioEditarRouter_12 = require('./routers/patrimonioEditarRouter_12');
const patrimonioRelatorioRoutes = require('./routers/patrimonioRelatorio');
const authRouter = require('./routers/authRouter');

//const { formatDate } = require('date-fns');
// const conRelatorioController = require('./controllers/conRelatorio'); // já está incluído nas rotas corretamente
app.use('/', authRouter);
app.use('/', conPatrimonio_00);
app.use('/', conPatrimonio_01);
app.use('/', conPatrimonio_02);
app.use('/', conPatrimonio_03);
app.use('/', conPatrimonio_04);
app.use('/', conPatrimonio_05);
app.use('/', conPatrimonio_06);
app.use('/', conPatrimonio_07);
app.use('/', conPatrimonio_08);
app.use('/', conPatrimonio_09);
app.use('/', conPatrimonio_10);
app.use('/', conPatrimonio_11);
app.use('/', conPatrimonio_12);

app.use('/', checarAutenticacao, patrimonioRouter);

app.use('/patrimonio_00', patrimonio_00Router);
app.use('/patrimonio_01', patrimonio_01Router);
app.use('/patrimonio_02', patrimonio_02Router);
app.use('/patrimonio_03', patrimonio_03Router);
app.use('/patrimonio_04', patrimonio_04Router);
app.use('/patrimonio_05', patrimonio_05Router);
app.use('/patrimonio_06', patrimonio_06Router);
app.use('/patrimonio_07', patrimonio_07Router);
app.use('/patrimonio_08', patrimonio_08Router);
app.use('/patrimonio_09', patrimonio_09Router);
app.use('/patrimonio_10', patrimonio_10Router);
app.use('/patrimonio_11', patrimonio_11Router);
app.use('/patrimonio_12', patrimonio_12Router);
app.use('/', patrimonioEditarRouter);
app.use('/', patrimonioEditarRouter_01);
app.use('/', patrimonioEditarRouter_02);
app.use('/', patrimonioEditarRouter_03);
app.use('/', patrimonioEditarRouter_04);
app.use('/', patrimonioEditarRouter_05);
app.use('/', patrimonioEditarRouter_06);
app.use('/', patrimonioEditarRouter_07);
app.use('/', patrimonioEditarRouter_08);
app.use('/', patrimonioEditarRouter_09);
app.use('/', patrimonioEditarRouter_10);
app.use('/', patrimonioEditarRouter_11);
app.use('/', patrimonioEditarRouter_12);
app.use('/patrimonioRelatorio', patrimonioRelatorioRoutes);






// Inicia servidor com Socket.IO
server.listen(8080, '0.0.0.0', () => {
  console.log('Servidor rodando com Socket.IO na porta 8080');
});
  