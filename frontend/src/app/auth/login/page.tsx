import { AuthProvider } from '@/hooks/useAuth';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
