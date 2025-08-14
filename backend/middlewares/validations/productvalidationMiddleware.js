import { body, param } from 'express-validator';

// Ürün oluşturma validation
export const validateCreateProduct = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Ürün adı zorunludur')
    .isLength({ min: 2, max: 200 })
    .withMessage('Ürün adı 2-200 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-\.\(\)]+$/)
    .withMessage('Ürün adı sadece harf, rakam, boşluk, tire, nokta ve parantez içerebilir'),
  
  body('description')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Ürün açıklaması zorunludur')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Ürün açıklaması 10-2000 karakter arasında olmalıdır'),
  
  body('images')
    .optional()
    .isArray({ min: 1, max: 6 })
    .withMessage('En az 1, en fazla 6 resim yüklenebilir'),
  
  body('images.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Resim URL\'si boş olamaz')
    .isURL()
    .withMessage('Geçerli bir resim URL\'si giriniz'),
  
  body('category')
    .isMongoId()
    .withMessage('Geçerli bir kategori ID\'si giriniz'),
  
  body('price')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Fiyat 0.01 ile 999999.99 arasında olmalıdır'),
  
  body('stock')
    .isInt({ min: 0, max: 999999 })
    .withMessage('Stok 0 ile 999999 arasında olmalıdır'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Özellikler obje formatında olmalıdır'),
  
  body('specifications.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Özellik değeri 1-500 karakter arasında olmalıdır'),
  
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('En fazla 20 etiket eklenebilir'),
  
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Etiket 1-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-]+$/)
    .withMessage('Etiket sadece harf, rakam, boşluk ve tire içerebilir'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Öne çıkan alanı boolean değer olmalıdır'),
  
  body('variants')
    .optional()
    .isArray({ max: 50 })
    .withMessage('En fazla 50 varyant eklenebilir'),
  
  body('variants.*.size')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Beden 1-20 karakter arasında olmalıdır'),
  
  body('variants.*.color')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Renk 1-20 karakter arasında olmalıdır'),
  
  body('variants.*.additionalPrice')
    .optional()
    .isFloat({ min: 0, max: 99999.99 })
    .withMessage('Ek fiyat 0 ile 99999.99 arasında olmalıdır'),
  
  body('averageRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Ortalama puan 0-5 arasında olmalıdır')
];

// Ürün güncelleme validation
export const validateUpdateProduct = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir ürün ID\'si giriniz'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Ürün adı 2-200 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-\.\(\)]+$/)
    .withMessage('Ürün adı sadece harf, rakam, boşluk, tire, nokta ve parantez içerebilir'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Ürün açıklaması 10-2000 karakter arasında olmalıdır'),
  
  body('images')
    .optional()
    .isArray({ min: 1, max: 6 })
    .withMessage('En az 1, en fazla 6 resim yüklenebilir'),
  
  body('images.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Resim URL\'si boş olamaz')
    .isURL()
    .withMessage('Geçerli bir resim URL\'si giriniz'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Geçerli bir kategori ID\'si giriniz'),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Fiyat 0.01 ile 999999.99 arasında olmalıdır'),
  
  body('stock')
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage('Stok 0 ile 999999 arasında olmalıdır'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Özellikler obje formatında olmalıdır'),
  
  body('specifications.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Özellik değeri 1-500 karakter arasında olmalıdır'),
  
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('En fazla 20 etiket eklenebilir'),
  
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Etiket 1-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-]+$/)
    .withMessage('Etiket sadece harf, rakam, boşluk ve tire içerebilir'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Öne çıkan alanı boolean değer olmalıdır'),
  
  body('variants')
    .optional()
    .isArray({ max: 50 })
    .withMessage('En fazla 50 varyant eklenebilir'),
  
  body('variants.*.size')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Beden 1-20 karakter arasında olmalıdır'),
  
  body('variants.*.color')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Renk 1-20 karakter arasında olmalıdır'),
  
  body('variants.*.additionalPrice')
    .optional()
    .isFloat({ min: 0, max: 99999.99 })
    .withMessage('Ek fiyat 0 ile 99999.99 arasında olmalıdır'),
  
  body('averageRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Ortalama puan 0-5 arasında olmalıdır')
];

// Ürün silme validation
export const validateDeleteProduct = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir ürün ID\'si giriniz')
];

// Ürün ID validation (genel kullanım için)
export const validateProductId = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir ürün ID\'si giriniz')
];

// Ürün arama validation
export const validateProductSearch = [
  body('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Arama terimi 1-100 karakter arasında olmalıdır'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Geçerli bir kategori ID\'si giriniz'),
  
  body('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum fiyat 0\'dan küçük olamaz'),
  
  body('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maksimum fiyat 0\'dan küçük olamaz'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Öne çıkan alanı boolean değer olmalıdır'),
  
  body('sortBy')
    .optional()
    .isString()
    .trim()
    .isIn(['name', 'price', 'createdAt', 'averageRating'])
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
    .withMessage('Sayfa başına ürün 1-100 arasında olmalıdır')
];

export default {
  validateCreateProduct,
  validateUpdateProduct,
  validateDeleteProduct,
  validateProductId,
  validateProductSearch
};
