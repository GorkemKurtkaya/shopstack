import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken } from '../middlewares/authmiddleware.js';
import { requireAdmin } from '../middlewares/authmiddleware.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

// Ürünler
router.get('/find/:id', productController.getAProduct);
router.get('/', productController.getAllProduct);

// Admin ürün yönetimi
router.post('/admin/products', authenticateToken, requireAdmin, upload.array('images', 6), productController.createProduct);
router.put('/admin/products/:id', authenticateToken, requireAdmin, productController.updateProduct);
router.delete('/admin/products/:id', authenticateToken, requireAdmin, productController.deleteProduct);

export default router;