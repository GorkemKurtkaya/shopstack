const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Types
export interface Address {
  _id?: string; 
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  addresses: Address[];
  favoriteCategories: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string; 
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'customer' | 'moderator';
  addresses?: Address[];
  favoriteCategories?: string[];
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  favoriteCategories?: string[];
}

export interface AddressUpdateData {
  addresses: Address[];
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface EmailVerificationData {
  token: string;
}

// Auth Responses
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  addresses?: Address[]; 
}

export interface CheckAuthResponse {
  isAuthenticated: boolean;
  user?: User;
}

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessage = result.errors[0]?.msg || 'Kayıt işlemi başarısız oldu';
        return { success: false, message: errorMessage };
      }
      return { success: false, message: result.message || 'Kayıt işlemi başarısız oldu' };
    }

    return { success: true, message: 'Kayıt başarılı!', user: result.user };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Bağlantı hatası oluştu' };
  }
};

// Login
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessage = result.errors[0]?.msg || 'Giriş bilgileri hatalı';
        return { success: false, message: errorMessage };
      }
      return { success: false, message: result.message || 'Giriş bilgileri hatalı' };
    }

    return { success: true, message: 'Giriş başarılı!', user: result.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Bağlantı hatası oluştu' };
  }
};

// Check Authentication Status
export const checkAuth = async (): Promise<CheckAuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/check-auth`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return { isAuthenticated: false };
    }

    const result = await response.json();
    
    if (result.succeeded && result.authenticated && result.user) {
      return { isAuthenticated: true, user: result.user };
    }
    
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Check auth error:', error);
    return { isAuthenticated: false };
  }
};

// Get Current User
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Logout
export const logout = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'GET',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

// Verify Email
export const verifyEmail = async (data: EmailVerificationData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Email doğrulama başarısız' };
    }

    return { success: true, message: 'Email başarıyla doğrulandı!' };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, message: 'Bağlantı hatası oluştu' };
  }
};

// Update Profile
export const updateProfile = async (data: ProfileUpdateData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Profil güncellenemedi' };
    }

    return { success: true, message: 'Profil başarıyla güncellendi!', user: result.user };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: 'Bağlantı hatası oluştu' };
  }
};

// Update Address
export const updateAddress = async (data: AddressUpdateData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/me/address`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Adres güncellenemedi' };
    }

    return { success: true, message: 'Adres başarıyla güncellendi!', user: result.user };
  } catch (error) {
    console.error('Update address error:', error);
    return { success: false, message: 'Bağlantı hatası oluştu' };
  }
};

// Forgot Password
export const forgotPassword = async (data: ForgotPasswordData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Şifre sıfırlama başarısız' };
    }

    return { success: true, message: 'Şifre sıfırlama emaili gönderildi!' };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, message: 'Bağlantı hatası oluştu' };
  }
};

// Reset Password
export const resetPassword = async (data: ResetPasswordData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: data.token, password: data.newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Şifre sıfırlama başarısız' };
    }

    return { success: true, message: 'Şifre başarıyla sıfırlandı!' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: 'Bağlantı hatası oluştu' };
  }
};
