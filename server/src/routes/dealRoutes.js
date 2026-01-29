const express = require('express');
const router = express.Router();
const dealsController = require('../controllers/dealsController');
const { auth, requireVerified } = require('../middleware/auth');

// Public routes
router.get('/', dealsController.getAllDeals);
router.get('/:id', auth, dealsController.getDealById);

// Protected routes
router.post('/:id/claim', auth, dealsController.claimDeal);
router.get('/user/claims', auth, dealsController.getUserClaims);

module.exports = router;