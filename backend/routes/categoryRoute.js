import express from 'express';
import { getCategories, getAllCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, getCategoryById } from '../controllers/categoryController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authmiddleware.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateDeleteCategory
} from '../middlewares/validations/categoryvalidationMiddleware.js';

const router = express.Router();

// Public
router.get('/categories/active', getCategories);
router.get('/categories', getAllCategories); 
router.get('/categories/:id', getCategoryById); 

// Admin
router.post('/admin/categories', authenticateToken, requireAdmin, validateCreateCategory, adminCreateCategory);
router.put('/admin/categories/:id', authenticateToken, requireAdmin, validateUpdateCategory, adminUpdateCategory);
router.delete('/admin/categories/:id', authenticateToken, requireAdmin, validateDeleteCategory, adminDeleteCategory);

export default router;
