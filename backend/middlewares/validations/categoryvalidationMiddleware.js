import { body, param } from 'express-validator';

// Kategori oluşturma validation
export const validateCreateCategory = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Kategori adı zorunludur')
    .isLength({ min: 2, max: 100 })
    .withMessage('Kategori adı 2-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Kategori adı sadece harf ve boşluk içerebilir'),
  
  body('slug')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Slug 2-100 karakter arasında olmalıdır')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug sadece küçük harf, rakam ve tire içerebilir'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active alanı boolean değer olmalıdır')
];

// Kategori güncelleme validation
export const validateUpdateCategory = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir kategori ID\'si giriniz'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Kategori adı 2-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Kategori adı sadece harf ve boşluk içerebilir'),
  
  body('slug')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Slug 2-100 karakter arasında olmalıdır')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug sadece küçük harf, rakam ve tire içerebilir'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active alanı boolean değer olmalıdır')
];

// Kategori silme validation
export const validateDeleteCategory = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir kategori ID\'si giriniz')
];

// Kategori ID validation (genel kullanım için)
export const validateCategoryId = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir kategori ID\'si giriniz')
];

// Kategori slug validation
export const validateCategorySlug = [
  param('slug')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Kategori slug\'ı zorunludur')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Geçerli bir slug formatı giriniz')
];

export default {
  validateCreateCategory,
  validateUpdateCategory,
  validateDeleteCategory,
  validateCategoryId,
  validateCategorySlug
};
