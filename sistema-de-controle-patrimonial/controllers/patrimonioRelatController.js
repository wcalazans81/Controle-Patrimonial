const conexao = require("../db");
const socketUtils = require('../utils/socket');
const io = socketUtils.getIO();

// 🔍 Busca geral por termo (campo de busca)
exports.buscarPatrimonio = (req, res) => {
    const { termo } = req.query;
    const likeTerm = `%${termo}%`;

    const query = `
        SELECT * 
        FROM patrimoniorelatorioA 
        WHERE 
            patrimoniorelatorioA.NpatrimonioA LIKE ? 
            OR patrimoniorelatorioA.descricaoA LIKE ? 
            OR patrimoniorelatorioA.empresaA LIKE ? 
            OR patrimoniorelatorioA.nomeA LIKE ? 
            OR patrimoniorelatorioA.setorA LIKE ? 
            OR patrimoniorelatorioA.destinoA LIKE ?
    `;

    conexao.query(
        query,
        [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm],
        (erro, resultados) => {
            if (erro) {
                console.error("Erro ao buscar:", erro);
                return res.status(500).json({ erro: "Erro ao buscar dados." });
            }
            res.json(resultados);
        }
    );
};

// 📋 Filtro por empresa e destino (via radios)
exports.filtrarPorEmpresaEDestino = (req, res) => {
    let { empresa, destino } = req.query;

    // Verificação dos parâmetros
    if (!empresa || !destino) {
        return res.status(400).json({ erro: "Empresa e destino são obrigatórios." });
    }

    // Limpa e padroniza
    empresa = empresa.trim().toLowerCase();
    destino = destino.trim().toLowerCase();

    const query = `
        SELECT * 
        FROM patrimoniorelatorioA 
        WHERE (patrimoniorelatorioA.empresaA) = ? 
        AND (patrimoniorelatorioA.destinoA) = ?
    `;

    conexao.query(query, [empresa, destino], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao filtrar:", erro);
            return res.status(500).json({ erro: "Erro ao buscar dados filtrados." });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ mensagem: "Nenhum patrimônio encontrado para os filtros selecionados." });
        }

        res.json(resultados);
    });
};
