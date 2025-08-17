import express from 'express';
import { createReview, getProductReviews, updateReview, deleteReview, approveReview, getAllReviews, checkUserReview } from '../controllers/reviewController.js';
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

// Admin 
router.get('/all', authenticateToken, requireAdmin, getAllReviews); 

// Public
router.get('/:productId', validateProductId, getProductReviews);

// Auth
router.post('/', authenticateToken, validateCreateReview, createReview);
router.put('/:reviewId', authenticateToken, validateUpdateReview, updateReview);
router.delete('/:reviewId', authenticateToken, validateDeleteReview, deleteReview);
router.get('/user/:productId', authenticateToken, checkUserReview);

// Admin
router.post('/:reviewId/approve', authenticateToken, requireAdmin, validateApproveReview, approveReview);

export default router;
