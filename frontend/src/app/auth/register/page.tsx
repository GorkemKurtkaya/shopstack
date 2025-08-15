import { AuthProvider } from '@/hooks/useAuth';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
