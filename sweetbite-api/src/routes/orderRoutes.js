const { Router } = require('express');
const { body } = require('express-validator');

const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { requireAuth, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

const VALID_SIZES = ['Small', 'Medium', 'Large'];
const VALID_FROSTINGS = ['Buttercream', 'Chocolate Ganache', 'Fresh Cream'];
const VALID_STATUSES = ['confirmed', 'baking', 'delivery', 'delivered', 'cancelled'];

const createValidators = [
  body('cakeId').isInt({ min: 1 }).withMessage('cakeId is required.'),
  body('size').isIn(VALID_SIZES).withMessage(`size must be one of: ${VALID_SIZES.join(', ')}`),
  body('frosting').isIn(VALID_FROSTINGS).withMessage(`frosting must be one of: ${VALID_FROSTINGS.join(', ')}`),
  body('customerName').trim().notEmpty().withMessage('customerName is required.'),
  body('customerPhone').trim().notEmpty().withMessage('customerPhone is required.'),
  body('deliveryAddress').trim().notEmpty().withMessage('deliveryAddress is required.'),
  body('deliveryDate').isISO8601().withMessage('deliveryDate must be a valid date (YYYY-MM-DD).'),
  body('notes').optional({ checkFalsy: true }).isString(),
];

const statusValidators = [
  body('status').isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
];

router.post('/', optionalAuth, createValidators, validate, asyncHandler(orderController.createOrder));

router.get('/:orderNumber', asyncHandler(orderController.getOrder));

router.get('/', requireAuth, requireAdmin, asyncHandler(orderController.listOrders));
router.patch('/:orderNumber/status', requireAuth, requireAdmin, statusValidators, validate, asyncHandler(orderController.updateOrderStatus));

module.exports = router;