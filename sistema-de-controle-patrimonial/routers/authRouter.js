const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificaAdmin } = require('../utils/authMiddleware'); // Middleware correto

// Rotas de autenticação
router.get('/login', authController.loginPage);
router.post('/login', authController.login);

router.get('/register', authController.registerPage);
router.post('/register', authController.register);

router.get('/logout', authController.logout);

// Recuperação de senha
router.get('/recuperar', authController.forgotPasswordPage);
router.post('/recuperar', authController.sendResetLink);

router.get('/resetar/:token', authController.resetPasswordPage);
router.post('/resetar/:token', authController.resetPassword);

// ROTAS DE ADMIN (Login de admin e aprovação)
router.post('/admin/login', (req, res) => {
  const { adminUser, adminSenha } = req.body;

  if (adminUser === 'calazans' && adminSenha === '12we4w5e') {
    req.session.user = {
      nome: 'Administrador',
      email: 'admin@affemg.com.br',
      is_admin: true
    };
    req.session.success_msg = 'Login de administrador realizado.';
    return res.redirect('/admin/dashboard'); // redireciona agora para o painel
  } else {
    req.session.error_msg = 'Credenciais inválidas.';
    return res.redirect('/admin/login');
  }
});
router.get('/admin/dashboard', verificaAdmin, (req, res) => {
  res.render('adminDashboard');
});
router.get('/admin/login', (req, res) => {
  res.render('adminLogin');
});

// Página para visualizar logs de acesso
router.get('/admin/logs', verificaAdmin, authController.verLogsAcesso);

// Tela de aprovação de usuários pendentes
router.get('/admin/aprovar', verificaAdmin, authController.adminApprovalPage);

// Aprovar usuário (POST com proteção admin)
router.post('/admin/aprovar/:id', verificaAdmin, authController.aprovarUsuario);

module.exports = router;
