import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken } from '../middlewares/authmiddleware.js';
import { requireAdmin } from '../middlewares/authmiddleware.js';
import { upload } from '../utils/multer.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateDeleteProduct,
  validateProductId
} from '../middlewares/validations/productvalidationMiddleware.js';

const router = express.Router();

// Ürünler
router.get('/find/:id', validateProductId, productController.getAProduct);
router.get('/', productController.getAllProduct);
router.get('/featured', productController.getFeaturedProducts);

// Admin ürün yönetimi
router.post('/admin/products', authenticateToken, requireAdmin, upload.array('images', 6), validateCreateProduct, productController.createProduct);
router.put('/admin/products/:id', authenticateToken, requireAdmin, validateUpdateProduct, productController.updateProduct);
router.delete('/admin/products/:id', authenticateToken, requireAdmin, validateDeleteProduct, productController.deleteProduct);

export default router;