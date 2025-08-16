import User from "../models/usermodel.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { sendEmail } from "../utils/mailer.js";


// Kullanıcı kayıt işlemi
const registerUserService = async (userData) => {
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        throw new Error("firstName, lastName, email ve password zorunludur");
    }

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new Error("Bu email ile bir kullanıcı zaten var");
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role || undefined,
        phoneNumber: userData.phoneNumber,
        addresses: userData.addresses,
        favoriteCategories: userData.favoriteCategories,
        emailVerificationToken
    });
    
    const verifyUrl = `${process.env.APP_URL || 'http://localhost:8000'}/auth/verify-email?token=${emailVerificationToken}`;
    await sendEmail({
        to: user.email,
        subject: 'E-posta Doğrulama',
        text: `Hesabınızı doğrulamak için bağlantıya tıklayın: ${verifyUrl}`,
        html: `<p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
    });
    return user;
};

// Kullanıcı giriş işlemi
const loginUserService = async (email, password) => {
    const emailNorm = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
        throw new Error("Yanlış email veya şifre");
    }

    const same = await bcrypt.compare(password, user.password);
    if (!same) {
        throw new Error("Yanlış email veya şifre", password, user.password);

    }


    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return { user, token };
};


export { registerUserService, loginUserService };

// Email doğrulama servisi
export const verifyEmailService = async (token) => {
    if (!token) throw new Error('Token gerekli');
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) throw new Error('Geçersiz token');
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    await user.save();
    return { message: 'Email doğrulandı' };
};

// Şifre sıfırlama isteği servisi
export const forgotPasswordService = async (emailRaw) => {
    const email = String(emailRaw || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
        return { message: 'Eğer kullanıcı varsa mail gönderildi' };
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();
    const resetUrl = `${process.env.APP_URL || 'http://localhost:8000'}/auth/reset-password?token=${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Şifre sıfırlama',
        text: `Şifrenizi sıfırlamak için bağlantı: ${resetUrl}`,
        html: `<p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });
    return { message: 'Mail gönderildi' };
};

// Şifre sıfırlama servisi
export const resetPasswordService = async (token, password) => {
    if (!token || !password) throw new Error('Token ve yeni şifre gerekli');
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
    if (!user) throw new Error('Token geçersiz veya süresi dolmuş');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return { message: 'Şifre güncellendi' };
};

// Me bilgisi servisi
export const getMeService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses,
        favoriteCategories: user.favoriteCategories,
        emailVerified: user.emailVerified,
    };
};

// Profil güncelleme servisi
export const updateProfileService = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const { firstName, lastName, phoneNumber, favoriteCategories } = data || {};
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (favoriteCategories !== undefined) user.favoriteCategories = favoriteCategories;
    await user.save();
    
    // Güncel kullanıcı bilgilerini döndür
    return { 
        message: 'Profil güncellendi',
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            addresses: user.addresses,
            favoriteCategories: user.favoriteCategories,
            emailVerified: user.emailVerified,
        }
    };
};

// Adres güncelleme servisi
export const updateAddressService = async (userId, addresses) => {
    if (!Array.isArray(addresses)) throw new Error('addresses array olmalıdır');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    user.addresses = addresses;
    await user.save();
    
    // Güncel adresleri döndür
    return { 
        message: 'Adresler güncellendi',
        addresses: user.addresses 
    };
};