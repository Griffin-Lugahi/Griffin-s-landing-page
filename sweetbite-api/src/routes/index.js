const { Router } = require('express');
const authRoutes = require('./authRoutes');
const cakeRoutes = require('./cakeRoutes');
const orderRoutes = require('./orderRoutes');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/cakes', cakeRoutes);
router.use('/orders', orderRoutes);

module.exports = router;