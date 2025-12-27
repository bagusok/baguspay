import type { BannerLocation } from "@repo/db/types";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useWindowSize } from "usehooks-ts";
import Image from "../image";
import "./banner.css";

type Banner = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  href_url: string | null;
  app_url: string | null;
  banner_location: BannerLocation;
  order: number;
  is_available: boolean;
  created_at: string;
  is_featured?: boolean;
  isFeatured?: boolean;
};

type Props = {
  home_top: Banner[];
  home_middle: Banner[];
  home_bottom: Banner[];
};

export default function HomeBanner({
  home_top,
  home_middle,
  home_bottom,
}: Props) {
  const { width } = useWindowSize();

  const hasAny =
    (home_top?.length ?? 0) +
      (home_middle?.length ?? 0) +
      (home_bottom?.length ?? 0) >
    0;

  if (!hasAny) return null;

  const renderSwiper = (
    banners: Banner[],
    opts?: { slides?: number; loop?: boolean },
  ) => {
    if (!banners || banners.length === 0) return null;
    const slidesPerView = opts?.slides ?? 1;
    const loop = opts?.loop ?? banners.length > 1;

    return (
      <Swiper
        grabCursor={true}
        centeredSlides={slidesPerView === 1}
        slidesPerView={slidesPerView}
        spaceBetween={12}
        pagination={{ clickable: true }}
        loop={loop}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Pagination, Autoplay]}
        className="h-full"
      >
        {banners.map((item, index) => (
          <SwiperSlide key={item.id ?? index} className="h-full">
            <Image
              src={item.image_url}
              alt={item.title}
              className="w-full h-full rounded-xl object-cover"
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  // Mobile/tablet: collapse into single slider in order: top -> middle -> bottom
  if (width < 1024) {
    const combined = [
      ...(home_top || []),
      ...(home_middle || []),
      ...(home_bottom || []),
    ];
    if (combined.length === 0) return null;

    return (
      <section className="w-full">
        {renderSwiper(combined, { slides: 1 })}
      </section>
    );
  }

  // Desktop: keep 3-box layout
  const topHasMany = (home_top?.length ?? 0) > 1;
  const middleHasMany = (home_middle?.length ?? 0) > 1;
  const bottomHasMany = (home_bottom?.length ?? 0) > 1;

  return (
    <section className="w-full overflow-hidden">
      <div className="grid grid-cols-3 grid-rows-[auto_1fr] gap-3">
        {/* Top area spans two columns */}
        <div className="w-full col-span-2">
          {home_top?.length ? (
            topHasMany ? (
              renderSwiper(home_top, { slides: 1, loop: home_top.length > 1 })
            ) : (
              <Image
                src={home_top[0].image_url}
                alt={home_top[0].title}
                className="w-full rounded-xl object-cover"
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full" />
          )}
        </div>

        {/* Right column (two rows): top uses home_middle, bottom uses home_bottom */}
        <div className="w-full col-span-1 row-span-2 grid grid-rows-[1fr_auto] gap-1 min-h-0">
          {/* Right-top: slider or single from middle */}
          <div className="w-full h-full min-h-0 overflow-hidden">
            {home_middle?.length ? (
              middleHasMany ? (
                renderSwiper(home_middle, { slides: 1 })
              ) : (
                <Image
                  src={home_middle[0].image_url}
                  alt={home_middle[0].title}
                  className="w-full h-full rounded-xl object-cover"
                  loading="lazy"
                />
              )
            ) : (
              <div className="w-full" />
            )}
          </div>

          {/* Right-bottom: static or slider from bottom */}
          <div className="w-full overflow-hidden">
            {home_bottom?.length ? (
              bottomHasMany ? (
                renderSwiper(home_bottom, { slides: 1 })
              ) : (
                <Image
                  src={home_bottom[0].image_url}
                  alt={home_bottom[0].title}
                  className="w-full rounded-xl object-cover"
                  loading="lazy"
                />
              )
            ) : (
              <div className="w-full" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
