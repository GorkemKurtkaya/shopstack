import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from '@/contexts/CartContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
