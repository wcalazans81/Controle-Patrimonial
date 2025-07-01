const express = require('express');
const router = express.Router();
const conexao = require('../db');
const socketUtils = require('../utils/socket');
const io = socketUtils.getIO();
// Rota para cadastrar os dados do patrimônio
router.post('/cadastrar_01', (req, res) => {
    let { andar_01, Npatrimonio_01, empresa_01, nome_01, setor_01, descricao_01, destino_01 } = req.body;

     // Verificar se os campos são strings antes de usar .toUpperCase()
     empresa_01 = typeof empresa_01 === 'string' ? empresa_01.toUpperCase() : '';
     nome_01 = typeof nome_01 === 'string' ? nome_01.toUpperCase() : '';
     setor_01 = typeof setor_01 === 'string' ? setor_01.toUpperCase() : '';
     descricao_01 = typeof descricao_01 === 'string' ? descricao_01.toUpperCase() : '';
     destino_01 = typeof destino_01 === 'string' ? destino_01.toUpperCase() : '';

    const dataAtual = new Date();
    const data = new Date(dataAtual.getTime() - (3 * 60 * 60 * 1000)) // Ajusta para -3h (Brasília)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

    const empresasValidas = ['AFFEMG', 'FUNDAFFEMG', 'FISCO CORRETORA', 'MAIS SABOR'];

    if (!empresasValidas.includes(empresa_01)) {
        return res.json({ sucesso: false, mensagem: "ERRO! A empresa deve ser AFFEMG, FUNDAFFEMG, FISCO CORRETORA ou MAIS SABOR." });
    }
    console.log("Dados recebidos:", req.body);

    const sql = `
        INSERT INTO patrimonio_01 (
            andar_01, Npatrimonio_01, empresa_01, nome_01, setor_01, data_01, descricao_01, destino_01
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexao.query(sql, [andar_01, Npatrimonio_01, empresa_01, nome_01, setor_01, data, descricao_01, destino_01], (erro) => {
        if (erro) {
            console.error("Erro ao cadastrar:", erro);
            return res.json({ sucesso: false, mensagem: "Erro ao salvar os dados.Teste de ERRO!!!!" });
        }

        // Segundo INSERT na tabela secundaria (relatório)
        const sql2 = `
            INSERT INTO patrimonioRelatorioA (
                andarA, NpatrimonioA, empresaA, nomeA, setorA, dataA, descricaoA, destinoA
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conexao.query(sql2, [andar_01, Npatrimonio_01, empresa_01, nome_01, setor_01, data, descricao_01, destino_01], (erro2) => {
            if (erro2) {
                console.error("Erro ao cadastrar na tabela patrimonioRelatorioA:", erro2);
                return res.json({ sucesso: false, mensagem: "Erro ao salvar os dados na tabela de relatório." });
            }

            // Sucesso nos dois INSERTs
           io.emit("atualizarPedidos"); // 🔄 Notifica os clientes
           return res.json({ sucesso: true, mensagem: "Dados salvos com sucesso nas duas tabelas!" });

        });
    });
});

// Excluir patrimonio (GET)
router.get('/excluir_01/:id', (req, res) => {
    const id = req.params.id;

    // Busca os dados do patrimônio a ser excluído
    const sqlSelect = 'SELECT * FROM patrimonio_01 WHERE id = ?';
    conexao.query(sqlSelect, [id], (erroSelect, resultadoSelect) => {
        if (erroSelect) {
            console.error("Erro ao buscar item:", erroSelect);
            return res.status(500).send("Erro ao buscar item.");
        }

        if (resultadoSelect.length === 0) {
            return res.status(404).send("Item não encontrado.");
        }

        const item = resultadoSelect[0];

        // Verifica se existe um item correspondente na tabela patrimoniorelatatorioA
        const sqlCheck = 'SELECT * FROM patrimoniorelatorioA WHERE NpatrimonioA = ?';
        conexao.query(sqlCheck, [item.Npatrimonio_01], (erroCheck, resultadoCheck) => {
            if (erroCheck) {
                console.error("Erro ao verificar correspondência:", erroCheck);
                return res.status(500).send("Erro ao verificar correspondência.");
            }

            const fazerDeletePatrimonio = () => {
                const sqlDelete = 'DELETE FROM patrimonio_01 WHERE id = ?';
                conexao.query(sqlDelete, [id], (erroDelete) => {
                    if (erroDelete) {
                        console.error("Erro ao excluir patrimônio:", erroDelete);
                        return res.status(500).send("Erro ao excluir patrimônio.");
                    }
                    io.emit("atualizarPedidos"); // 🔄 Notifica todos os clientes
                    return res.redirect('/patrimonio_01');
                });
            };

            if (resultadoCheck.length > 0) {
                // Se encontrou correspondência, deleta da patrimoniorelatorioA
                const sqlDeleteRelat = 'DELETE FROM patrimoniorelatorioA WHERE NpatrimonioA = ?';
                conexao.query(sqlDeleteRelat, [item.Npatrimonio_01], (erroDeleteRelat) => {
                    if (erroDeleteRelat) {
                        console.error("Erro ao excluir do histórico:", erroDeleteRelat);
                        return res.status(500).send("Erro ao excluir do histórico.");
                    }
                    fazerDeletePatrimonio();
                });
            } else {
                // Caso não exista correspondência, só exclui da patrimonio_01
                fazerDeletePatrimonio();
            }
        });
    });
});

module.exports = router;
