"use client";

import { Carousel, Button } from 'antd';
import Image from 'next/image';

const bannerData = [
  {
    id: 1,
    title: "Yeni Sezon Ürünleri",
    subtitle: "%50'ye varan indirimler",
    image: "/banner1.jpeg", 
    buttonText: "Alışverişe Başla",
    buttonLink: "/products"
  },
  {
    id: 2,
    title: "Teknoloji Fırsatları",
    subtitle: "En son teknoloji ürünleri",
    image: "/banner2.jpeg", 
    buttonText: "Keşfet",
    buttonLink: "/categories/technology"
  },
  {
    id: 3,
    title: "Ücretsiz Kargo",
    subtitle: "150 TL üzeri alışverişlerde",
    image: "/banner3.jpeg", 
    buttonText: "Alışveriş Yap",
    buttonLink: "/products"
  }
];

export default function HeroCarousel() {
  return (
    <section className="mb-12">
      <Carousel autoplay dots={{ className: 'bottom-4' }} effect="fade">
        {bannerData.map((banner) => (
          <div key={banner.id} className="relative">
            <div className="relative h-96 md:h-[500px]">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {banner.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    {banner.subtitle}
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700 border-0 h-12 px-8 text-lg"
                  >
                    {banner.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}
