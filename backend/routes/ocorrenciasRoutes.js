const express = require('express');
const router = express.Router();
const occController = require('../controllers/ocorrenciasController');
const { verifyToken } = require('../auth');

router.get('/', occController.listar);
router.post('/', verifyToken, occController.criar);
router.post('/:id/vote', verifyToken, occController.votar);
router.get('/ranking', occController.ranking);

module.exports = router;
