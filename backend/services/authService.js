import User from "../models/usermodel.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { sendEmail } from "../utils/mailer.js";


// Kullanıcı kayıt işlemi
export const registerUserService = async (userData) => {
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

    const verifyHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8ff;padding:32px">
        <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;box-shadow:0 8px 24px rgba(16,24,40,.06);overflow:hidden" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:28px 28px 0 28px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff">
              <h1 style="margin:0;font-size:20px;font-weight:700">E-posta Doğrulama</h1>
              <p style="margin:6px 0 0;font-size:13px;opacity:.95">Hesabınızı aktifleştirmek için aşağıdaki adımları izleyin.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px">
              <p style="margin:0 0 12px;color:#344054;font-size:14px">Aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın:</p>
              <p style="margin:0 0 18px">
                <a href="${verifyUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600">E-postamı Doğrula</a>
              </p>
              <p style="margin:0 0 8px;color:#475467;font-size:13px">Veya aşağıdaki bağlantıyı tarayıcınıza yapıştırın:</p>
              <p style="word-break:break-all;margin:0 0 16px"><a href="${verifyUrl}" style="color:#6366f1;text-decoration:none">${verifyUrl}</a></p>
              <div style="background:#f9fafb;border:1px solid #eaecf0;border-radius:12px;padding:12px 14px">
                <div style="font-size:12px;color:#667085;margin-bottom:6px">Doğrulama Token'ınız:</div>
                <code style="display:block;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#111827;word-break:break-all">${emailVerificationToken}</code>
              </div>
              <p style="margin:14px 0 0;color:#98a2b3;font-size:12px">Bu bağlantı sınırlı süre için geçerlidir. Eğer bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
            </td>
          </tr>
          <tr>
            <td style="height:12px;background:linear-gradient(135deg,#6366f1,#a855f7)"></td>
          </tr>
        </table>
      </div>`;

    await sendEmail({
        to: user.email,
        subject: 'E-posta Doğrulama',
        text: `Hesabınızı doğrulamak için bağlantıya tıklayın: ${verifyUrl}`,
        html: verifyHtml
    });
    return user;
};

// Kullanıcı giriş işlemi
export const loginUserService = async (email, password) => {
    const emailNorm = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
        throw new Error("Yanlış email veya şifre");
    }

    const same = await bcrypt.compare(password, user.password);
    if (!same) {
        throw new Error("Yanlış email veya şifre", password, user.password);

    }


    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "3d" }
    );
    return { user, token };
};



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
    const resetHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8ff;padding:32px">
        <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;box-shadow:0 8px 24px rgba(16,24,40,.06);overflow:hidden" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:28px 28px 0 28px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff">
              <h1 style="margin:0;font-size:20px;font-weight:700">Şifre Sıfırlama</h1>
              <p style="margin:6px 0 0;font-size:13px;opacity:.95">Hesabınız için yeni bir şifre belirleyin.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px">
              <p style="margin:0 0 12px;color:#344054;font-size:14px">Aşağıdaki buton ile şifrenizi sıfırlayın:</p>
              <p style="margin:0 0 18px">
                <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600">Şifreyi Sıfırla</a>
              </p>
              <p style="margin:0 0 8px;color:#475467;font-size:13px">Veya bağlantıyı tarayıcınıza yapıştırın:</p>
              <p style="word-break:break-all;margin:0 0 16px"><a href="${resetUrl}" style="color:#6366f1;text-decoration:none">${resetUrl}</a></p>
              <div style="background:#f9fafb;border:1px solid #eaecf0;border-radius:12px;padding:12px 14px">
                <div style="font-size:12px;color:#667085;margin-bottom:6px">Sıfırlama Token'ınız:</div>
                <code style="display:block;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#111827;word-break:break-all">${token}</code>
              </div>
              <p style="margin:14px 0 0;color:#98a2b3;font-size:12px">Bu bağlantı sınırlı süre için geçerlidir (15 dakika). Eğer bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>
            </td>
          </tr>
          <tr>
            <td style="height:12px;background:linear-gradient(135deg,#6366f1,#a855f7)"></td>
          </tr>
        </table>
      </div>`;

    await sendEmail({
        to: user.email,
        subject: 'Şifre Sıfırlama',
        text: `Şifrenizi sıfırlamak için bağlantı: ${resetUrl}`,
        html: resetHtml
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