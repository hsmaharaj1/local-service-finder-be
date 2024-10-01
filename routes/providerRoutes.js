const express = require('express');
const providerController = require('../controllers/providerController');
const router = express.Router();

router.post('/add-provider', providerController.addProvider);
router.post('/add-provider-details', providerController.addProviderDetails);
router.get('/details/:id', providerController.getProviderDetails);
router.put('/update-provider-details/:userId', providerController.updateProviderDetails);

module.exports = router;
