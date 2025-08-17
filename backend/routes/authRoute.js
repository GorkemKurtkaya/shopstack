import express from "express";
import * as authController from "../controllers/authController.js";
import * as authMiddleWare from "../middlewares/authmiddleware.js";
import { checkUser } from "../middlewares/authmiddleware.js";
import { loginRateLimiter } from "../middlewares/rate-limitmiddleware.js";
import {
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validateForgotPassword,
  validateResetPassword,
  validateProfileUpdate,
  validateAddressUpdate,
} from "../middlewares/validations/authvalidationMiddleware.js";

const router = express.Router();



// Auth işlemleri
router.post("/register", validateRegistration, authController.registerUser);
router.post('/login', loginRateLimiter, validateLogin, authController.loginUser);
router.post('/verify-email', validateEmailVerification, authController.verifyEmail);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/logout', authController.getLogout);


// Kullanıcı işlemleri
router.get('/me', authMiddleWare.authenticateToken, authController.getMe);
router.put('/me/profile', authMiddleWare.authenticateToken, validateProfileUpdate, authController.updateProfile);
router.put('/me/address', authMiddleWare.authenticateToken, validateAddressUpdate, authController.updateAddress);


// Kullanıcı durumu kontrolü
router.get("/check-auth", checkUser, authController.checkAuthStatus);
router.get("/check-admin",  authController.checkAdmin);



export default router;
