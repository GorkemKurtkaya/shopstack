import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authmiddleware.js';
import {
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateOrderStatus,
  validateDeleteOrder,
  validateUserId,
  validateOrderId
} from '../middlewares/validations/ordervalidationMiddleware.js';

const router = express.Router();


// Auth
router.post('/', authenticateToken, validateCreateOrder, orderController.createOrder);
router.put('/:id', authenticateToken, validateUpdateOrder, orderController.updateOrder);
router.put("/status/:id", authenticateToken, validateUpdateOrderStatus, orderController.updateOrderStatus);
router.get("/find/:userId", authenticateToken, validateUserId, orderController.getUserOrders);
router.get("/findorder/:id", authenticateToken, validateOrderId, orderController.getOrder);

// Admin
router.delete('/:id', authenticateToken, requireAdmin, validateDeleteOrder, orderController.deleteOrder);
router.get("/", authenticateToken, requireAdmin, orderController.getAllOrders);
router.get("/income", authenticateToken, requireAdmin, orderController.getOrderIncome);



export default router;