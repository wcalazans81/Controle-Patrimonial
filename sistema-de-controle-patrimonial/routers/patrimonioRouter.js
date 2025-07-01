const express = require('express');
const router = express.Router();

// Rota principal "/" – será a página inicial
router.get('/', (req, res) => {
    res.render('patrimonio'); // Essa view será carregada como home
});

module.exports = router;



