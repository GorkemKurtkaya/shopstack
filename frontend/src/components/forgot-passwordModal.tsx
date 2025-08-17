"use client";

import { useEffect, useState } from 'react';
import { Modal, Input as AntInput, message } from 'antd';
import { MailOutlined, KeyOutlined, LockOutlined, ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { forgotPassword, resetPassword } from '@/services/auth';
import { useRouter } from 'next/navigation';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export default function ForgotPasswordModal({ open, onClose, initialEmail }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [email, setEmail] = useState(initialEmail || '');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setStep('email');
      setEmail(initialEmail || '');
      setToken('');
      setNewPassword('');
    }
  }, [open, initialEmail]);

  const handleEmailSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await forgotPassword({ email });
      if (res.success) {
        message.success('Mailiniz gönderildi, lütfen tokenı girin');
        setStep('token');
      } else {
        message.error(res.message || 'İşlem başarısız');
      }
    } catch (e) {
      message.error('İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await resetPassword({ token, newPassword });
      if (res.success) {
        message.success('Şifreniz güncellendi, giriş yapabilirsiniz');
        onClose();
        router.push('/auth/login');
      } else {
        message.error(res.message || 'İşlem başarısız');
      }
    } catch (e) {
      message.error('İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-2xl"
      title={
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow">
            {step === 'email' ? <MailOutlined /> : <KeyOutlined />}
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">
              {step === 'email' ? 'Şifre Sıfırlama' : 'Token ile Şifre Sıfırla'}
            </div>
            <div className="text-xs text-gray-500">{step === 'email' ? 'Adım 1 / 2' : 'Adım 2 / 2'}</div>
          </div>
        </div>
      }
    >
      {step === 'email' ? (
        <div className="space-y-5">
          <div className="text-sm text-gray-600 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
            Kayıtlı e-posta adresinizi girin. Sıfırlama bağlantısı/token gönderilecektir.
          </div>
          <AntInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            prefix={<MailOutlined className="text-gray-400" />}
            className="h-11 rounded-xl"
          />
          <div className="flex gap-2">
            <button
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-md disabled:opacity-50"
              onClick={handleEmailSubmit}
              disabled={!email || submitting}
            >
              {submitting ? 'Gönderiliyor...' : (
                <span className="inline-flex items-center gap-2">Mail Gönder <ArrowRightOutlined /></span>
              )}
            </button>
            <button
              className="px-4 py-2.5 rounded-xl bg-white text-gray-600 hover:text-gray-800 border border-gray-200"
              onClick={onClose}
            >
              İptal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
            <CheckCircleFilled className="text-green-500" />
            Mail gönderildi. Lütfen aşağıya aldığınız tokenı ve yeni şifrenizi girin.
          </div>
          <AntInput
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
            prefix={<KeyOutlined className="text-gray-400" />}
            className="h-11 rounded-xl"
          />
          <AntInput.Password
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Yeni şifre"
            prefix={<LockOutlined className="text-gray-400" />}
            className="h-11 rounded-xl"
          />
          <div className="flex gap-2">
            <button
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium shadow-md disabled:opacity-50"
              onClick={handleResetSubmit}
              disabled={!token || !newPassword || submitting}
            >
              {submitting ? 'Gönderiliyor...' : 'Şifreyi Sıfırla'}
            </button>
            <button
              className="px-4 py-2.5 rounded-xl bg-white text-gray-600 hover:text-gray-800 border border-gray-200"
              onClick={onClose}
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}


