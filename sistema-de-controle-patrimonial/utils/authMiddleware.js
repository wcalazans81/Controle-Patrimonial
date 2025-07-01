// utils/authMiddleware.js
exports.verificaAutenticado = (req, res, next) => {
  return req.session.user ? next() : res.redirect('/login');
};

exports.verificaAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.is_admin) {
    return next();
  }
  req.session.error_msg = 'Acesso restrito ao administrador.';
  return res.redirect('/admin/login');
};

