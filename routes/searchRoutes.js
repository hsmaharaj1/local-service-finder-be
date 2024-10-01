const express = require('express');
const searchController = require('../controllers/searchController');
const router = express.Router();

router.post('/search', searchController.searchProviders);
router.get('/random', searchController.searchRandom);

module.exports = router;