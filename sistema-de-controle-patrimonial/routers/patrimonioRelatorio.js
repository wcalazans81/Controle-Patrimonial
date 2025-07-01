const express = require("express");
const router = express.Router();
const patrimonioController = require("../controllers/patrimonioRelatController");

router.get("/", (req, res) => {
    res.render("patrimonioRelatorio");
});

router.get("/buscar", patrimonioController.buscarPatrimonio);
router.get("/filtro", patrimonioController.filtrarPorEmpresaEDestino);

module.exports = router;
