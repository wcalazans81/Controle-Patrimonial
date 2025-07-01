const express = require('express');
const router = express.Router();
const conexao = require('../db');
const socketUtils = require('../utils/socket');
const io = socketUtils.getIO();

// Rota para cadastrar os dados do patrimônio
router.post('/cadastrar_07', (req, res) => {
    let { andar_07, Npatrimonio_07, empresa_07, nome_07, setor_07, descricao_07, destino_07 } = req.body;

    // Verificar se os campos são strings antes de usar .toUpperCase()
    empresa_07 = typeof empresa_07 === 'string' ? empresa_07.toUpperCase() : '';
    nome_07 = typeof nome_07 === 'string' ? nome_07.toUpperCase() : '';
    setor_07 = typeof setor_07 === 'string' ? setor_07.toUpperCase() : '';
    descricao_07 = typeof descricao_07 === 'string' ? descricao_07.toUpperCase() : '';
    destino_07 = typeof destino_07 === 'string' ? destino_07.toUpperCase() : '';

    const dataAtual = new Date();
    const data = new Date(dataAtual.getTime() - (3 * 60 * 60 * 1000)) // Ajusta para -3h (Brasília)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

    const empresasValidas = ['AFFEMG', 'FUNDAFFEMG', 'FISCO CORRETORA', 'MAIS SABOR'];

    if (!empresasValidas.includes(empresa_07)) {
        return res.json({ sucesso: false, mensagem: "ERRO! A empresa deve ser AFFEMG, FUNDAFFEMG, FISCO CORRETORA ou MAIS SABOR." });
    }

    console.log("Dados recebidos:", req.body);

    const sql = `
        INSERT INTO patrimonio_07 (
            andar_07, Npatrimonio_07, empresa_07, nome_07, setor_07, data_07, descricao_07, destino_07
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexao.query(sql, [andar_07, Npatrimonio_07, empresa_07, nome_07, setor_07, data, descricao_07, destino_07], (erro) => {
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

        conexao.query(sql2, [andar_07, Npatrimonio_07, empresa_07, nome_07, setor_07, data, descricao_07, destino_07], (erro2) => {
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
router.get('/excluir_07/:id', (req, res) => {
    const id = req.params.id;

    // Busca os dados do patrimônio a ser excluído
    const sqlSelect = 'SELECT * FROM patrimonio_07 WHERE id = ?';
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
        conexao.query(sqlCheck, [item.Npatrimonio_07], (erroCheck, resultadoCheck) => {
            if (erroCheck) {
                console.error("Erro ao verificar correspondência:", erroCheck);
                return res.status(500).send("Erro ao verificar correspondência.");
            }

            const fazerDeletePatrimonio = () => {
                const sqlDelete = 'DELETE FROM patrimonio_07 WHERE id = ?';
                conexao.query(sqlDelete, [id], (erroDelete) => {
                    if (erroDelete) {
                        console.error("Erro ao excluir patrimônio:", erroDelete);
                        return res.status(500).send("Erro ao excluir patrimônio.");
                    }
                    io.emit("atualizarPedidos"); // 🔄 Notifica todos os clientes
                    return res.redirect('/patrimonio_07');
                });
            };

            if (resultadoCheck.length > 0) {
                // Se encontrou correspondência, deleta da patrimoniorelatorioA
                const sqlDeleteRelat = 'DELETE FROM patrimoniorelatorioA WHERE NpatrimonioA = ?';
                conexao.query(sqlDeleteRelat, [item.Npatrimonio_07], (erroDeleteRelat) => {
                    if (erroDeleteRelat) {
                        console.error("Erro ao excluir do histórico:", erroDeleteRelat);
                        return res.status(500).send("Erro ao excluir do histórico.");
                    }
                    fazerDeletePatrimonio();
                });
            } else {
                // Caso não exista correspondência, só exclui da patrimonio_07
                fazerDeletePatrimonio();
            }
        });
    });
});

module.exports = router;
