import express from 'express';
import { createReview, getProductReviews, updateReview, deleteReview, approveReview } from '../controllers/reviewController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authmiddleware.js';
import {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  validateApproveReview,
  validateProductId,
  validateReviewId
} from '../middlewares/validations/reviewvalidationMiddleware.js';

const router = express.Router();

// Public
router.get('/:productId', validateProductId, getProductReviews);

// Auth
router.post('/', authenticateToken, validateCreateReview, createReview);
router.put('/:reviewId', authenticateToken, validateUpdateReview, updateReview);
router.delete('/:reviewId', authenticateToken, validateDeleteReview, deleteReview);

// Admin
router.post('/:reviewId/approve', authenticateToken, requireAdmin, validateApproveReview, approveReview);

export default router;
