import express from 'express';
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../controllers/categoryController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authmiddleware.js';

const router = express.Router();

// Public
router.get('/categories', getCategories);

// Admin
router.post('/admin/categories', authenticateToken, requireAdmin, adminCreateCategory);
router.put('/admin/categories/:id', authenticateToken, requireAdmin, adminUpdateCategory);
router.delete('/admin/categories/:id', authenticateToken, requireAdmin, adminDeleteCategory);

export default router;
