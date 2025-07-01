const conexao = require('../db');

module.exports = {
  create: (usuario, cb) => {
    const sql = 'INSERT INTO usuarios (nome, email, senha, aprovado) VALUES (?, ?, ?, ?)';
    conexao.query(sql, [usuario.nome, usuario.email, usuario.senha, usuario.aprovado], cb);
  },

  findByEmail: (email, cb) => {
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    conexao.query(sql, [email], (err, results) => {
      if (err) return cb(err);
      cb(null, results[0]);
    });
  },

  findByToken: (token, cb) => {
    const sql = 'SELECT * FROM usuarios WHERE token_recuperacao = ? AND token_expira > NOW()';
    conexao.query(sql, [token], (err, results) => {
      if (err) return cb(err);
      cb(null, results[0]);
    });
  },

  updateToken: (id, token, expira, cb) => {
    const sql = 'UPDATE usuarios SET token_recuperacao = ?, token_expira = ? WHERE id = ?';
    conexao.query(sql, [token, expira, id], cb);
  },

  resetSenha: (id, hash, cb) => {
    const sql = 'UPDATE usuarios SET senha = ?, token_recuperacao = NULL, token_expira = NULL WHERE id = ?';
    conexao.query(sql, [hash, id], cb);
  },

  logAcesso: (id, ip, browser, cb) => {
    const sql = 'INSERT INTO logs_acesso (usuario_id, ip, navegador, data_hora) VALUES (?, ?, ?, NOW())';
    conexao.query(sql, [id, ip, browser], cb);
  },

  listPendentes: (cb) => {
    const sql = 'SELECT id, nome, email FROM usuarios WHERE aprovado = 0';
    conexao.query(sql, cb);
  },

  approve: (id, aprovado, cb) => {
    const sql = 'UPDATE usuarios SET aprovado = ? WHERE id = ?';
    conexao.query(sql, [aprovado, id], cb);
  },

  findById: (id, cb) => {
    const sql = 'SELECT nome, email FROM usuarios WHERE id = ?';
    conexao.query(sql, [id], (err, results) => {
      if (err) return cb(err);
      cb(null, results[0]);
    });
  }
};
