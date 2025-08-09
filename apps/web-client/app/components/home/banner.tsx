import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useWindowSize } from "usehooks-ts";
import "./banner.css";

const banner = [
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    link: "/welcome",
  },
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/1448x520-HB-UnlimitedCB3.png?tr=w-750%2Cq-75",
    link: "/welcome",
  },
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/LG_ID-1448x520-HB-Roblox_Get_25__More_Robux%20(1).png?tr=w-3840%2Cq-75",
    link: "/welcome",
  },
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202508/1448x520-HB-Shopeepay_Agt.png?tr=w-750%2Cq-75",
    link: "/welcome",
  },
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    link: "/welcome",
  },
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/1448x520-HB-UnlimitedCB3.png?tr=w-750%2Cq-75",
    link: "/welcome",
  },
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/LG_ID-1448x520-HB-Roblox_Get_25__More_Robux%20(1).png?tr=w-3840%2Cq-75",
    link: "/welcome",
  },
  {
    title: "Selamat Datang di Baguspay",
    description: "Aplikasi pembayaran digital yang memudahkan transaksi Anda.",
    image:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202508/1448x520-HB-Shopeepay_Agt.png?tr=w-750%2Cq-75",
    link: "/welcome",
  },
];

export default function HomeBanner() {
  const { width } = useWindowSize();

  return (
    <section className="w-full">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={width < 768 || banner.length < 3 ? 1 : 1.5}
        spaceBetween={10}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 2,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        className="mySwiper"
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
      >
        {banner.map((item, index) => (
          <SwiperSlide key={index}>
            <img src={item.image} alt={item.title} className="rounded-xl" />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
