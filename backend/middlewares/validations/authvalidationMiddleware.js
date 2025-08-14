import { body } from 'express-validator';

// Kullanıcı kayıt validation
export const validateRegistration = [
  body('firstName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Ad alanı zorunludur')
    .isLength({ min: 2, max: 50 })
    .withMessage('Ad 2-50 karakter arasında olmalıdır'),
  
  body('lastName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Soyad alanı zorunludur')
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyad 2-50 karakter arasında olmalıdır'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir')
];

// Kullanıcı giriş validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  
  body('password')
    .notEmpty()
    .withMessage('Şifre alanı zorunludur')
];

// Email doğrulama validation
export const validateEmailVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  
  body('verificationCode')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Doğrulama kodu zorunludur')
    .isLength({ min: 4, max: 10 })
    .withMessage('Doğrulama kodu 4-10 karakter arasında olmalıdır')
];

// Şifre sıfırlama isteği validation
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz')
];

// Şifre sıfırlama validation
export const validateResetPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  
  body('resetToken')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Sıfırlama token\'ı zorunludur'),
  
  body('newPassword')
    .isLength({ min: 6, max: 100 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir')
];

// Profil güncelleme validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ad 2-50 karakter arasında olmalıdır'),
  
  body('lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyad 2-50 karakter arasında olmalıdır'),
  
  body('phone')
    .optional()
    .isMobilePhone('tr-TR')
    .withMessage('Geçerli bir telefon numarası giriniz'),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir doğum tarihi giriniz')
];

// Adres güncelleme validation
export const validateAddressUpdate = [
  body('address')
    .isObject()
    .withMessage('Adres bilgisi obje formatında olmalıdır'),
  
  body('address.street')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Sokak adresi zorunludur')
    .isLength({ min: 5, max: 100 })
    .withMessage('Sokak adresi 5-100 karakter arasında olmalıdır'),
  
  body('address.city')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Şehir zorunludur')
    .isLength({ min: 2, max: 50 })
    .withMessage('Şehir 2-50 karakter arasında olmalıdır'),
  
  body('address.postalCode')
    .isPostalCode('TR')
    .withMessage('Geçerli bir posta kodu giriniz'),
  
  body('address.country')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ülke 2-50 karakter arasında olmalıdır')
];


