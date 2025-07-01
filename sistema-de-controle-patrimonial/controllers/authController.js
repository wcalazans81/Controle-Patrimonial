const UAParser = require('ua-parser-js');
const bcrypt = require('bcrypt');
const mailer = require('../utils/mailer');
const gerarToken = require('../utils/tokenGenerator');
const User = require('../models/UserModel');
const moment = require('moment');
const conexao = require('../db');

// Página de login
exports.loginPage = (req, res) => {
  res.render('login');
};

// Página de registro
exports.registerPage = (req, res) => {
  res.render('register');
};

// Página de recuperação de senha
exports.forgotPasswordPage = (req, res) => {
  res.render('forgotPassword');
};

// Página de redefinição de senha (token)
exports.resetPasswordPage = (req, res) => {
  const token = req.params.token;
  User.findByToken(token, (err, user) => {
    if (err || !user) {
      req.session.error_msg = 'Token inválido ou expirado';
      return res.redirect('/recuperar');
    }
    res.render('resetPassword', { token });
  });
};

// Página de aprovação de usuários
exports.adminApprovalPage = (req, res) => {
  User.listPendentes((err, usuarios) => {
    if (err) {
      console.error('Erro ao listar usuários pendentes:', err);
      console.log('Usuários pendentes:', usuarios);
      console.log('Entrou na página de aprovação de usuários');

      req.session.error_msg = 'Erro ao carregar usuários';
      return res.redirect('/');
    }
    res.render('adminApproval', { usuarios });
  });
};

// Registro de usuário
exports.register = (req, res) => {
  const { nome, email, senha, confirmarSenha } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;

  // Validar nome
  if (!nomeRegex.test(nome)) {
    req.session.error_msg = 'Nome inválido. Use apenas letras e espaços.';
    return res.redirect('/register');
  }

  // Validar e-mail
  if (!emailRegex.test(email)) {
    req.session.error_msg = 'E-mail inválido.';
    return res.redirect('/register');
  }

  // Validar se senhas coincidem
  if (senha !== confirmarSenha) {
    req.session.error_msg = 'As senhas não coincidem.';
    return res.redirect('/register');
  }

  // Validar tamanho mínimo da senha
  if (senha.length < 6) {
    req.session.error_msg = 'A senha deve ter no mínimo 6 caracteres.';
    return res.redirect('/register');
  }

  const dominio = email.split('@')[1];
  const aprovado = (dominio === 'affemg.com.br');

  bcrypt.hash(senha, 10, (err, hash) => {
    if (err) {
      req.session.error_msg = 'Erro ao registrar';
      return res.redirect('/register');
    }

    const usuario = {
      nome,
      email,
      senha: hash,
      aprovado
    };

    User.create(usuario, (err2) => {
      if (err2) {
        req.session.error_msg = 'Erro ao registrar usuário ou e-mail já cadastrado';
        return res.redirect('/register');
      }

      if (aprovado) {
        req.session.success_msg = 'Cadastro realizado com sucesso! Você já pode fazer login.';
      } else {
        req.session.success_msg = 'Cadastro enviado. Aguarde aprovação do administrador.';
      }

      res.redirect('/login');
    });
  });
};

// Login
exports.login = (req, res) => {
  const { email, senha } = req.body;

  User.findByEmail(email, (err, usuario) => {
    if (err || !usuario) {
      req.session.error_msg = 'Usuário não encontrado';
      return res.redirect('/login');
    }

    if (!usuario.aprovado) {
      req.session.error_msg = 'Usuário ainda não aprovado. Aguarde aprovação do administrador.';
      return res.redirect('/login');
    }

    bcrypt.compare(senha, usuario.senha, (erro, igual) => {
      if (!igual) {
        req.session.error_msg = 'Senha incorreta';
        return res.redirect('/login');
      }

      // Loga usuário
      req.session.user = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        is_admin: usuario.is_admin
      };

      // Log de acesso
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

      const parser = new UAParser(req.headers['user-agent']);
      const browserInfo = parser.getBrowser();   // ex: { name: 'Chrome', version: '137.0.0.0' }
      const osInfo = parser.getOS();             // ex: { name: 'Windows', version: '10' }

      // Fallbacks para evitar undefined
      const browserName = browserInfo.name || 'Navegador desconhecido';
      const browserVersion = (browserInfo.version || '0.0').split('.')[0];
      const osName = osInfo.name || 'SO desconhecido';
      const osVersion = osInfo.version || '';

      const browser = `${browserName} ${browserVersion} (${osName} ${osVersion})`;
      console.log('Browser formatado:', browser); // ✅ veja no terminal como está chegando

      User.logAcesso(usuario.id, ip, browser, () => {
        // Apenas loga, sem impedir acesso
      });

     req.session.success_msg = 'Login realizado com sucesso';

    if (usuario.is_admin) {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/');
    }
    });
  });
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// Envio de link de recuperação
exports.sendResetLink = (req, res) => {
  const { email } = req.body;

  User.findByEmail(email, (err, usuario) => {
    if (err || !usuario) {
      req.session.error_msg = 'E-mail não encontrado';
      return res.redirect('/recuperar');
    }

    const token = gerarToken();
    const expira = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

    User.updateToken(usuario.id, token, expira, (err2) => {
      if (err2) {
        req.session.error_msg = 'Erro ao gerar token';
        return res.redirect('/recuperar');
      }

      const link = `http://${req.headers.host}/resetar/${token}`;
      const html = `<p>Clique para redefinir sua senha: <a href="${link}">${link}</a></p>`;

      mailer.sendMail({
        to: email,
        subject: 'Recuperação de Senha',
        html
      }, (err3) => {
        if (err3) {
          req.session.error_msg = 'Erro ao enviar e-mail';
          return res.redirect('/recuperar');
        }

        req.session.success_msg = 'Link de recuperação enviado para seu e-mail.';
        res.redirect('/login');
      });
    });
  });
};

// Redefinição de senha
exports.resetPassword = (req, res) => {
  const token = req.params.token;
  const { senha } = req.body;

  User.findByToken(token, (err, usuario) => {
    if (err || !usuario) {
      req.session.error_msg = 'Token inválido ou expirado';
      return res.redirect('/recuperar');
    }

    bcrypt.hash(senha, 10, (erroHash, hash) => {
      if (erroHash) {
        req.session.error_msg = 'Erro ao redefinir senha';
        return res.redirect(`/resetar/${token}`);
      }

      User.resetSenha(usuario.id, hash, () => {
        req.session.success_msg = 'Senha redefinida com sucesso!';
        res.redirect('/login');
      });
    });
  });
};

// Aprovar usuário
exports.aprovarUsuario = async (req, res) => {
  const id = req.params.id;

  try {
    // Atualiza o status para aprovado
    await conexao.promise().query('UPDATE usuarios SET aprovado = 1 WHERE id = ?', [id]);

    // Busca o usuário aprovado para pegar e-mail e nome
    const [resultado] = await conexao.promise().query('SELECT nome, email FROM usuarios WHERE id = ?', [id]);
    const usuario = resultado[0];

    // Envia e-mail ao usuário aprovado
    const html = `
      <p>Olá, <strong>${usuario.nome}</strong>.</p>
      <p>Seu cadastro foi aprovado pelo administrador.</p>
      <p>Você já pode acessar o sistema com seu e-mail: <strong>${usuario.email}</strong>.</p>
      <p><a href="http://${req.headers.host}/login">Clique aqui para fazer login</a>.</p>
    `;

    await mailer.sendMail({
      to: usuario.email,
      subject: 'Cadastro aprovado - AFFEMG',
      html
    });

    req.session.success_msg = 'Usuário aprovado e notificado por e-mail com sucesso!';
    res.redirect('/admin/aprovar');

  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    req.session.error_msg = 'Erro ao aprovar usuário.';
    res.redirect('/admin/aprovar');
  }
};


exports.verLogsAcesso = (req, res) => {
  const sql = `
    SELECT l.id, u.nome, u.email, l.ip, l.navegador, l.data_hora
    FROM logs_acesso l
    JOIN usuarios u ON l.usuario_id = u.id
    ORDER BY l.data_hora DESC
  `;

  conexao.query(sql, (err, resultados) => {
    if (err) {
      console.error('Erro ao buscar logs de acesso:', err);
      req.session.error_msg = 'Erro ao carregar logs de acesso.';
      return res.redirect('/admin/dashboard');
    }

    // 🟢 Converte cada `data_hora` em Date para formatar corretamente no Handlebars
    resultados.forEach(log => {
      log.data_hora = new Date(log.data_hora);
    });

    res.render('adminLogs', { logs: resultados });
  });
};


