const express = require('express');
const router = express.Router();
const conexao = require('../db'); // certifique-se de que o caminho está certo

router.get('/', (req, res) => {
    const sql = 'SELECT * FROM patrimonio_04 ORDER BY data_04 DESC';

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar dados: teste de ERRR!", erro);
            return res.render('patrimonio_04', { patrimonio_04: [] }); // nome correto da variável
        }

        res.render('patrimonio_04', { patrimonio_04: resultados }); // envia os dados para a view
    });
});

module.exports = router;
