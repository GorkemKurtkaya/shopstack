import { body, param } from 'express-validator';

// Review oluşturma validation
export const validateCreateReview = [
  body('product')
    .isMongoId()
    .withMessage('Geçerli bir ürün ID\'si giriniz'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Puan 1-5 arasında olmalıdır'),
  
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Yorum 10-1000 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-\.\,\!\?\'\"]+$/)
    .withMessage('Yorum sadece harf, rakam, boşluk ve temel noktalama işaretleri içerebilir')
];

// Review güncelleme validation
export const validateUpdateReview = [
  param('reviewId')
    .isMongoId()
    .withMessage('Geçerli bir review ID\'si giriniz'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Puan 1-5 arasında olmalıdır'),
  
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Yorum 10-1000 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-\.\,\!\?\'\"]+$/)
    .withMessage('Yorum sadece harf, rakam, boşluk ve temel noktalama işaretleri içerebilir')
];

// Review silme validation
export const validateDeleteReview = [
  param('reviewId')
    .isMongoId()
    .withMessage('Geçerli bir review ID\'si giriniz')
];

// Review onaylama validation (Admin)
export const validateApproveReview = [
  param('reviewId')
    .isMongoId()
    .withMessage('Geçerli bir review ID\'si giriniz'),
  
  body('approved')
    .isBoolean()
    .withMessage('Onay durumu boolean değer olmalıdır')
];

// Review ID validation (genel kullanım için)
export const validateReviewId = [
  param('reviewId')
    .isMongoId()
    .withMessage('Geçerli bir review ID\'si giriniz')
];

// Ürün ID validation (review listesi için)
export const validateProductId = [
  param('productId')
    .isMongoId()
    .withMessage('Geçerli bir ürün ID\'si giriniz')
];

// Review arama ve filtreleme validation
export const validateReviewSearch = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Puan 1-5 arasında olmalıdır'),
  
  body('approved')
    .optional()
    .isBoolean()
    .withMessage('Onay durumu boolean değer olmalıdır'),
  
  body('sortBy')
    .optional()
    .isString()
    .trim()
    .isIn(['rating', 'createdAt', 'updatedAt'])
    .withMessage('Geçerli bir sıralama alanı seçiniz'),
  
  body('sortOrder')
    .optional()
    .isString()
    .trim()
    .isIn(['asc', 'desc'])
    .withMessage('Sıralama yönü asc veya desc olmalıdır'),
  
  body('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Sayfa numarası 1-1000 arasında olmalıdır'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Sayfa başına review 1-100 arasında olmalıdır')
];

// Review toplu işlem validation
export const validateBulkReviewAction = [
  body('reviewIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('En az 1, en fazla 100 review seçilmelidir'),
  
  body('reviewIds.*')
    .isMongoId()
    .withMessage('Geçerli review ID\'leri giriniz'),
  
  body('action')
    .isString()
    .trim()
    .isIn(['approve', 'reject', 'delete'])
    .withMessage('Geçerli bir işlem seçiniz (approve, reject, delete)')
];

export default {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  validateApproveReview,
  validateReviewId,
  validateProductId,
  validateReviewSearch,
  validateBulkReviewAction
};
