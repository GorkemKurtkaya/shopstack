import { body, param } from 'express-validator';

// Türkiye posta kodu validasyonu için özel regex
const turkishPostalCodeRegex = /^[0-9]{5}$/;

// Sipariş oluşturma validation
export const validateCreateOrder = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('En az bir ürün seçilmelidir'),
  
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Geçerli bir ürün ID\'si giriniz'),
  
  body('orderItems.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Ürün miktarı 1-100 arasında olmalıdır'),
  
  body('orderItems.*.price')
    .isFloat({ min: 0.01 })
    .withMessage('Geçerli bir fiyat giriniz'),
  
  body('orderItems.*.variant.size')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Beden 1-20 karakter arasında olmalıdır'),
  
  body('orderItems.*.variant.color')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Renk 1-20 karakter arasında olmalıdır'),
  
  body('shippingAddress')
    .isObject()
    .withMessage('Kargo adresi obje formatında olmalıdır'),
  
  body('shippingAddress.street')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Sokak adresi zorunludur')
    .isLength({ min: 5, max: 100 })
    .withMessage('Sokak adresi 5-100 karakter arasında olmalıdır'),
  
  body('shippingAddress.city')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Şehir zorunludur')
    .isLength({ min: 2, max: 50 })
    .withMessage('Şehir 2-50 karakter arasında olmalıdır'),
  
  body('shippingAddress.state')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İl/eyalet 2-50 karakter arasında olmalıdır'),
  
  body('shippingAddress.zipCode')
    .matches(turkishPostalCodeRegex)
    .withMessage('Geçerli bir Türkiye posta kodu giriniz (5 haneli sayı)'),
  
  body('shippingAddress.country')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ülke 2-50 karakter arasında olmalıdır'),
  
  body('paymentInfo.method')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Ödeme yöntemi zorunludur')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery', 'paypal'])
    .withMessage('Geçerli bir ödeme yöntemi seçiniz'),
  
  body('paymentInfo.status')
    .optional()
    .isString()
    .trim()
    .isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
    .withMessage('Geçerli bir ödeme durumu seçiniz'),
  
  body('paymentInfo.transactionId')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('İşlem ID\'si 5-100 karakter arasında olmalıdır'),
  
  body('totalAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Toplam tutar 0.01\'den büyük olmalıdır'),
  
  body('status')
    .optional()
    .isString()
    .trim()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Geçerli bir sipariş durumu seçiniz')
];

// Sipariş güncelleme validation
export const validateUpdateOrder = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir sipariş ID\'si giriniz'),
  
  body('orderItems')
    .optional()
    .isArray({ min: 1 })
    .withMessage('En az bir ürün seçilmelidir'),
  
  body('orderItems.*.product')
    .optional()
    .isMongoId()
    .withMessage('Geçerli bir ürün ID\'si giriniz'),
  
  body('orderItems.*.quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Ürün miktarı 1-100 arasında olmalıdır'),
  
  body('orderItems.*.price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Geçerli bir fiyat giriniz'),
  
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Kargo adresi obje formatında olmalıdır'),
  
  body('shippingAddress.street')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Sokak adresi 5-100 karakter arasında olmalıdır'),
  
  body('shippingAddress.city')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Şehir 2-50 karakter arasında olmalıdır'),
  
  body('shippingAddress.state')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İl/eyalet 2-50 karakter arasında olmalıdır'),
  
  body('shippingAddress.zipCode')
    .optional()
    .matches(turkishPostalCodeRegex)
    .withMessage('Geçerli bir Türkiye posta kodu giriniz (5 haneli sayı)'),
  
  body('shippingAddress.country')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ülke 2-50 karakter arasında olmalıdır'),
  
  body('paymentInfo.method')
    .optional()
    .isString()
    .trim()
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery', 'paypal'])
    .withMessage('Geçerli bir ödeme yöntemi seçiniz'),
  
  body('paymentInfo.status')
    .optional()
    .isString()
    .trim()
    .isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
    .withMessage('Geçerli bir ödeme durumu seçiniz'),
  
  body('paymentInfo.transactionId')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('İşlem ID\'si 5-100 karakter arasında olmalıdır'),
  
  body('totalAmount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Toplam tutar 0.01\'den büyük olmalıdır'),
  
  body('status')
    .optional()
    .isString()
    .trim()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Geçerli bir sipariş durumu seçiniz')
];

// Sipariş durumu güncelleme validation
export const validateUpdateOrderStatus = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir sipariş ID\'si giriniz'),
  
  body('status')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Sipariş durumu zorunludur')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Geçerli bir sipariş durumu seçiniz')
];

// Sipariş silme validation
export const validateDeleteOrder = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir sipariş ID\'si giriniz')
];

// Kullanıcı ID validation
export const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('Geçerli bir kullanıcı ID\'si giriniz')
];

// Sipariş ID validation (genel kullanım için)
export const validateOrderId = [
  param('id')
    .isMongoId()
    .withMessage('Geçerli bir sipariş ID\'si giriniz')
];

export default {
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateOrderStatus,
  validateDeleteOrder,
  validateUserId,
  validateOrderId
};
