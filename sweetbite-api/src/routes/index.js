const { Router } = require('express');
const authRoutes = require('./authRoutes');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);

// Next up, following the same pattern:
// router.use('/cakes', require('./cakeRoutes'));
// router.use('/orders', require('./orderRoutes'));

module.exports = router;
