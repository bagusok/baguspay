import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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
  created_at: string;
  is_featured?: boolean;
  isFeatured?: boolean;
};

type Props = {
  banners: Banner[];
};

export default function HomeBanner({ banners }: Props) {
  const { width } = useWindowSize();

  if (!banners || banners.length === 0) {
    return null;
  }

  const count = banners.length;

  // Helpers
  const isFeat = (b: Banner) => Boolean(b.isFeatured ?? b.is_featured);

  // 1 banner: slideable but simple (no coverflow)
  if (count === 1) {
    const item = banners[0];
    return (
      <section className="w-full">
        <Swiper
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          spaceBetween={12}
          pagination={{ clickable: true }}
          loop={false}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          modules={[Pagination, Autoplay]}
        >
          <SwiperSlide key={item.id ?? 0}>
            <Image
              src={item.image_url}
              alt={item.title}
              className="w-full rounded-xl object-cover"
              loading="lazy"
            />
          </SwiperSlide>
        </Swiper>
      </section>
    );
  }

  // 2 banners: simple swiper (no coverflow), show 1 on mobile, 2 on md+
  if (count === 2) {
    return (
      <section className="w-full">
        <Swiper
          grabCursor={true}
          centeredSlides={false}
          slidesPerView={width < 768 ? 1 : 2}
          spaceBetween={12}
          pagination={{ clickable: true }}
          loop={false}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          modules={[Pagination, Autoplay]}
        >
          {banners.map((item, index) => (
            <SwiperSlide key={item.id ?? index}>
              <Image
                src={item.image_url}
                alt={item.title}
                className="w-full rounded-xl object-cover"
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  }

  // 3 or more banners: grid 2 rows
  // Row 1 (full width): featured banners (if multiple -> slide). If none, use index 1 as fallback (or 0 if not exists)
  // Row 2: two columns; right column is a slider of remaining banners; left column shows one static banner from the remaining.
  const featuredIdx = banners
    .map((b, i) => (isFeat(b) ? i : -1))
    .filter((i) => i >= 0);

  const topIndices: number[] =
    featuredIdx.length > 0 ? featuredIdx : [banners[1] ? 1 : 0];

  const usedTop = new Set(topIndices);
  const restIndices = banners.map((_, i) => i).filter((i) => !usedTop.has(i));

  const bottomLeftIndex = restIndices[0];
  const bottomRightIndices = restIndices.slice(1);

  // On mobile & tablet (width < 1024), collapse grid into a single slider (featured-first order)
  if (width < 1024) {
    const order = [...topIndices, ...restIndices];
    return (
      <section className="w-full">
        <Swiper
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          spaceBetween={12}
          pagination={{ clickable: true }}
          loop={order.length > 1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          modules={[Pagination, Autoplay]}
        >
          {order.map((idx) => {
            const item = banners[idx];
            return (
              <SwiperSlide key={item.id ?? idx}>
                <Image
                  src={item.image_url}
                  alt={item.title}
                  className="w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden">
      <div className="grid grid-cols-3 grid-rows-[auto_1fr] gap-3">
        {/* Row 1: Featured area (span both columns) */}
        <div className="w-full col-span-2">
          {topIndices.length > 1 ? (
            <Swiper
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={1}
              spaceBetween={12}
              pagination={{ clickable: true }}
              loop={false}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              modules={[Pagination, Autoplay]}
            >
              {topIndices.map((idx) => {
                const item = banners[idx];
                return (
                  <SwiperSlide key={item.id ?? idx}>
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      className="w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            (() => {
              const item = banners[topIndices[0]];
              return (
                <Image
                  src={item.image_url}
                  alt={item.title}
                  className="w-full rounded-xl object-cover"
                  loading="lazy"
                />
              );
            })()
          )}
        </div>
        {/* Right column: two rows (top slider, bottom static) */}
        <div className="w-full col-span-1 row-span-2 grid grid-rows-[1fr_auto] gap-1 min-h-0">
          {/* Right-bottom: formerly bottom-left static banner */}
          {bottomLeftIndex !== undefined ? (
            <div className="w-full overflow-hidden">
              {(() => {
                const item = banners[bottomLeftIndex];
                return (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    className="w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                );
              })()}
            </div>
          ) : (
            <div className="w-full" />
          )}

          {/* Right-top: slider of remaining banners */}
          {bottomRightIndices.length > 0 ? (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <Swiper
                grabCursor={true}
                centeredSlides={false}
                slidesPerView={1}
                spaceBetween={12}
                pagination={{ clickable: true }}
                loop={bottomRightIndices.length > 1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                modules={[Pagination, Autoplay]}
                className="h-full"
              >
                {bottomRightIndices.map((idx) => {
                  const item = banners[idx];
                  return (
                    <SwiperSlide key={item.id ?? idx} className="h-full">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full rounded-xl object-cover"
                        loading="lazy"
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          ) : (
            <div className="w-full" />
          )}
        </div>
      </div>
    </section>
  );
}
