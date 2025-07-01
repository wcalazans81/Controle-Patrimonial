const express = require('express');
const router = express.Router();
const conexao = require('../db'); // certifique-se de que o caminho está certo
const socketUtils = require('../utils/socket');
const io = socketUtils.getIO();

router.get('/', (req, res) => {
    const sql = 'SELECT * FROM patrimonio_00 ORDER BY data_00 DESC';

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar dados:", erro);
            return res.render('patrimonio_00', { patrimonio_00: [] }); // nome correto da variável
        }
        res.render('patrimonio_00', { patrimonio_00: resultados }); // envia os dados para a view
    });
});

module.exports = router;
