// db.js
const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12we4w5eWE=',
    database: 'manutencao'
});

conexao.connect(function (erro) {
    if (erro) throw erro;
    console.log('Conexão efetuada com sucesso!');
});

module.exports = conexao;
