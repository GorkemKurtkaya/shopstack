import { 
    registerUserService, 
    loginUserService,
    verifyEmailService,
    forgotPasswordService,
    resetPasswordService,
    getMeService,
    updateProfileService,
    updateAddressService
} from "../services/authService.js";
import logger from "../utils/logger.js";
import { validationResult } from 'express-validator';



// Register İşlemi
export const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ succeeded: false, errors: errors.array() });
        }
        logger.info("Registering user");
        const user = await registerUserService(req.body);
        res.status(201).json({
            succeeded: true,
            user: user._id
        });
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        res.status(400).json({
            succeeded: false,
            error: error.message
        });
    }
};

// Login İşlemi
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await loginUserService(email, password);


        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'Lax'
        });

        res.cookie("user", user._id.toString(), {
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'Lax'
        });

        res.status(200).json({
            succeeded: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified
            },
            token,
            message: "Login successful"
        });
        logger.info("Login successful");
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            message: error.message
        });
        logger.error(`Error: ${error.message}`);
    }
};


// Logout İşlemi
export const getLogout = (req, res) => {
    res.cookie("jwt", "", {
        maxAge: 0, 
        httpOnly: true, 
        path: '/', 
        sameSite: 'Lax' 
    });

    res.cookie("user", "", {
        maxAge: 0,
        path: '/',
        sameSite: 'Lax'
    });

    res.status(200).json({
        succeeded: true,
        message: "Logged out successfully"
    });
    logger.info("Logged out successfully");
};



// Email doğrulama
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const result = await verifyEmailService(token);
        return res.status(200).json({ succeeded: true, ...result });
    } catch (error) {
        const message = error.message || 'Beklenmeyen hata';
        const status = message.toLowerCase().includes('token') ? 400 : 500;
        return res.status(status).json({ succeeded: false, message });
    }
};

// Şifre sıfırlama isteği
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await forgotPasswordService(email);
        return res.status(200).json({ succeeded: true, ...result });
    } catch (error) {
        return res.status(500).json({ succeeded: false, message: error.message });
    }
};

// Şifre sıfırlama
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const result = await resetPasswordService(token, password);
        return res.status(200).json({ succeeded: true, ...result });
    } catch (error) {
        const message = error.message || 'Beklenmeyen hata';
        const status = message.toLowerCase().includes('token') ? 400 : 500;
        return res.status(status).json({ succeeded: false, message });
    }
};

// Me bilgisi
export const getMe = async (req, res) => {
    try {
        const result = await getMeService(req.user._id);
        return res.status(200).json(result);
    } catch (error) {
        const message = error.message || 'Beklenmeyen hata';
        const status = message.toLowerCase().includes('not found') ? 404 : 500;
        return res.status(status).json({ succeeded: false, message });
    }
};

// Me profil güncelleme
export const updateProfile = async (req, res) => {
    try {
        const result = await updateProfileService(req.user._id, req.body);
        return res.status(200).json({ succeeded: true, ...result });
    } catch (error) {
        const message = error.message || 'Beklenmeyen hata';
        const status = message.toLowerCase().includes('not found') ? 404 : 500;
        return res.status(status).json({ succeeded: false, message });
    }
};

// Me adres güncelleme
export const updateAddress = async (req, res) => {
    try {
        const { addresses } = req.body;
        const result = await updateAddressService(req.user._id, addresses);
        return res.status(200).json({ succeeded: true, ...result });
    } catch (error) {
        const message = error.message || 'Beklenmeyen hata';
        const status = message.toLowerCase().includes('array') ? 400 : (message.toLowerCase().includes('not found') ? 404 : 500);
        return res.status(status).json({ succeeded: false, message });
    }
};

// Kullanıcı durumu kontrolü
export const checkAuthStatus = async (req, res) => {
    try {
        if (res.locals.user) {
            res.status(200).json({
                succeeded: true,
                authenticated: true,
                user: {
                    id: res.locals.user._id,
                    firstName: res.locals.user.firstName,
                    lastName: res.locals.user.lastName,
                    email: res.locals.user.email,
                    role: res.locals.user.role,
                    emailVerified: res.locals.user.emailVerified
                }
            });
        } else {
            res.status(401).json({
                succeeded: false,
                authenticated: false,
                message: "Unauthorized"
            });
        }
    } catch (error) {
        logger.error(`Auth check error: ${error.message}`);
        res.status(500).json({
            succeeded: false,
            authenticated: false,
            message: "Internal server error"
        });
    }
};