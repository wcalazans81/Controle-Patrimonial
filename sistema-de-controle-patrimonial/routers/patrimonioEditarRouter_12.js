const express = require('express');
const router = express.Router();
const conexao = require('../db');

// Rota direta para editar
router.get('/patrimonioEditar_12/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM patrimonio_12 WHERE id = ?';

    conexao.query(sql, [id], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar patrimônio:", erro);
            return res.render('patrimonioEditar', { patrimonio: null });
        }

        if (resultados.length === 0) {
            return res.send('Patrimônio não encontrado.');
        }

        res.render('patrimonioEditar_12', { patrimonio: resultados[0] });
    });
});

router.post('/patrimonioAtualizar_12/:id', (req, res) => {
    const { andar_12, patrimonio_12, empresa_12, nome_12, setor_12, descricao_12, destino_12 } = req.body;
    const id = req.params.id;
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);
    const data = dataAtual.toISOString().split('T')[0];

    conexao.beginTransaction(err => {
        if (err) {
            console.error("Erro ao iniciar transação:", err);
            return res.status(500).send("Erro interno.");
        }

        // Atualiza a tabela principal
        const sqlUpdatePrincipal = `
            UPDATE patrimonio_12 
            SET andar_12 = ?, Npatrimonio_12 = ?, empresa_12 = ?, nome_12 = ?, 
                setor_12 = ?, data_12 = ?, descricao_12 = ?, destino_12 = ? 
            WHERE id = ?`;

        conexao.query(sqlUpdatePrincipal, [andar_12, patrimonio_12, empresa_12, nome_12, setor_12, data, descricao_12, destino_12, id], (erro1) => {
            if (erro1) {
                return conexao.rollback(() => {
                    console.error("Erro ao atualizar tabela principal:", erro1);
                    res.status(500).send("Erro ao atualizar dados.");
                });
            }

            console.log("Tabela patrimonio_12 atualizada com sucesso.");

            // Verifica se o patrimônio já existe na tabela patrimonioRelatorioA
            const sqlCheck = `SELECT id FROM patrimonioRelatorioA WHERE NpatrimonioA = ?`;

            conexao.query(sqlCheck, [patrimonio_12], (erroCheck, resultados) => {
                if (erroCheck) {
                    return conexao.rollback(() => {
                        console.error("Erro na verificação:", erroCheck);
                        res.status(500).send("Erro interno ao verificar existência do patrimônio.");
                    });
                }

                if (resultados.length > 0) {
                    // Patrimônio já existe, realiza o UPDATE
                    console.log("Patrimônio já existe, realizando UPDATE na tabela patrimonioRelatorioA.");

                    const sqlUpdateRelatorio = `
                        UPDATE patrimonioRelatorioA 
                        SET andarA = ?, empresaA = ?, nomeA = ?, setorA = ?, 
                            dataA = ?, descricaoA = ?, destinoA = ? 
                        WHERE NpatrimonioA = ?`;

                    conexao.query(sqlUpdateRelatorio, [andar_12, empresa_12, nome_12, setor_12, data, descricao_12, destino_12, patrimonio_12], (erro2) => {
                        if (erro2) {
                            return conexao.rollback(() => {
                                console.error("Erro ao atualizar relatório:", erro2);
                                res.status(500).send("Erro ao atualizar relatório.");
                            });
                        }

                        console.log("Tabela patrimonioRelatorioA atualizada com sucesso.");
                        conexao.commit(errCommit => {
                            if (errCommit) {
                                return conexao.rollback(() => {
                                    console.error("Erro no commit:", errCommit);
                                    res.status(500).send("Erro ao finalizar a transação.");
                                });
                            }
                            res.redirect('/patrimonio_12');
                        });
                    });
                } else {
                    // Patrimônio não existe, insere um novo registro
                    console.log("Patrimônio não encontrado na tabela patrimonioRelatorioA, realizando INSERT.");

                    const sqlInsertRelatorio = `
                        INSERT INTO patrimonioRelatorioA (NpatrimonioA, andarA, empresaA, nomeA, setorA, dataA, descricaoA, destinoA) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                    conexao.query(sqlInsertRelatorio, [patrimonio_12, andar_12, empresa_12, nome_12, setor_12, data, descricao_12, destino_12], (erroInsert) => {
                        if (erroInsert) {
                            return conexao.rollback(() => {
                                console.error("Erro ao inserir relatório:", erroInsert);
                                res.status(500).send("Erro ao inserir relatório.");
                            });
                        }

                        console.log("Novo patrimônio inserido na tabela patrimonioRelatorioA.");
                        conexao.commit(errCommit => {
                            if (errCommit) {
                                return conexao.rollback(() => {
                                    console.error("Erro no commit:", errCommit);
                                    res.status(500).send("Erro ao finalizar a transação.");
                                });
                            }
                            res.redirect('/patrimonio_12');
                        });
                    });
                }
            });
        });
    });
});


module.exports = router;
