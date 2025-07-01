const express = require('express');
const router = express.Router();
const conexao = require('../db'); // certifique-se de que o caminho está certo

router.get('/', (req, res) => {
    const sql = 'SELECT * FROM patrimonio_11 ORDER BY data_11 DESC';

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar dados: teste de ERRR!", erro);
            return res.render('patrimonio_11', { patrimonio_11: [] }); // nome correto da variável
        }

        res.render('patrimonio_11', { patrimonio_11: resultados }); // envia os dados para a view
    });
});

module.exports = router;
