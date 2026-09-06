const { Router } = require('express');
const authRoutes = require('./authRoutes');
const cakeRoutes = require('./cakeRoutes');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/cakes', cakeRoutes);

module.exports = router;