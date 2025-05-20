// app/page.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function HomePage() {
  const images = [
    "https://thaihealthacademy.com/files/banner/2025/02/35922719-C53C-445E-A638-836DAA8E1711_banner.jpg",
    "https://thaihealthacademy.com/files/banner/2023/07/5FF5F57E-2427-49AF-9264-AF1C772B2121_banner.jpg",
    "https://thaihealthacademy.com/files/banner/2023/06/CBF1F1B2-39C3-4342-BC3E-515983012872_banner.jpg",
  ];

  return (
    <main className="w-full">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 3000 }}
        loop
        spaceBetween={0}
        slidesPerView={1}
        className="w-full"
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={src}
              alt={`banner-${idx}`}
              className="w-full h-auto object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </main>
  );
}
