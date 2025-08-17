"use client";

import HeroCarousel from '@/components/home/HeroCarousel';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroCarousel />
      <FeaturedProducts />
    </div>
  );
}
