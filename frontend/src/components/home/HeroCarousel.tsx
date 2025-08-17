"use client";

import { Carousel, Button } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import banner1Img from '../../../public/banner1.jpeg';
import banner2Img from '../../../public/banner2.jpeg';
import banner3Img from '../../../public/banner3.jpeg';

const bannerData = [
  {
    id: 1,
    title: "Yeni Sezon Ürünleri",
    subtitle: "%50'ye varan indirimler",
    image: banner1Img,
    buttonText: "Alışverişe Başla",
    buttonLink: "/products"
  },
  {
    id: 2,
    title: "Teknoloji Fırsatları",
    subtitle: "En son teknoloji ürünleri",
    image: banner2Img,
    buttonText: "Keşfet",
    buttonLink: "/products"
  },
  {
    id: 3,
    title: "Ücretsiz Kargo",
    subtitle: "150 TL üzeri alışverişlerde",
    image: banner3Img,
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
            <div className="relative h-96 md:h-[500px] bg-gray-900">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="100vw"
                className="object-cover z-0"
                priority
              />
              <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center text-white px-6 py-6 md:px-10 md:py-8">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    {banner.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-gray-100/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
                    {banner.subtitle}
                  </p>
                  <Link href={banner.buttonLink} aria-label={banner.buttonText}>
                    <Button
                      type="primary"
                      size="large"
                      className="h-12 px-8 text-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
                    >
                      {banner.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}
