// Anda mungkin perlu mengimpor tipe ProductCategoryTypeEnum jika belum global
// import { ProductCategoryType } from './schema';

import { db } from "@/database";
import { ProductCategoryType } from "@/schema";
import { tb } from "@/table";

// Data seed untuk tabel product_categories
export const seedGame = [
  {
    id: "51e11eb0-6821-4ee2-9cf4-d71d4102d7d8",
    slug: "honkai-star-rail",
    name: "Honkai: Star Rail",
    sub_name: "Topup Oneiric Shard",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up Oneiric Shard untuk Honkai: Star Rail dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/f4e8407b5f404dfc9cc1ecf977bd3d571737079825.webp",
    publisher: "HoYoverse",
    is_available: true,
    is_featured: false,
    label: "15%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "065a90e4-8993-4fab-9c04-65bf431c26b4",
    slug: "genshin-impact",
    name: "Genshin Impact",
    sub_name: null,
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up Genesis Crystals untuk Genshin Impact dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/8d44ed074f604a88a72c44b81e9be1081741056734.webp",
    publisher: "miHoYo",
    is_available: true,
    is_featured: false,
    label: "16%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "e7af2c4d-f6ba-45bf-9b6b-612673581148",
    slug: "zenless-zone-zero",
    name: "Zenless Zone Zero",
    sub_name: null,
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up untuk Zenless Zone Zero dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/3be9b3dc62804b7198494ab6d66637a11737100387.webp",
    publisher: "HoYoverse",
    is_available: true,
    is_featured: false,
    label: "15%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "ef425981-90c7-47f9-ab2d-8aa5c8661940",
    slug: "wuthering-waves-gp",
    name: "Wuthering Waves",
    sub_name: "Google Play",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up untuk Wuthering Waves (Google Play) dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/a84dc90a904f4ac2b8129d7709f975951741250789.webp",
    publisher: "Kuro Game",
    is_available: true,
    is_featured: false,
    label: "21%OFF",
    delivery_type: "Kode Google Play",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "98bb80e5-c0b4-441a-b1ac-22f5b48c3eea",
    slug: "wuthering-waves",
    name: "Wuthering Waves",
    sub_name: "UID Top-Up",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up untuk Wuthering Waves (UID) dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/9f97933c8f474dd98a9ca2143cf8668d1745835533.webp",
    publisher: "Kuro Game",
    is_available: true,
    is_featured: false,
    label: "15%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "33709a74-9af4-494b-9ae1-3c03afcfcb57",
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    sub_name: null,
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up UC untuk PUBG Mobile dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/dc2d7c5609bb499385fefb39024d86cf1740989324.webp",
    publisher: "Tencent",
    is_available: true,
    is_featured: false,
    label: "2%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "5dafee79-ee66-471d-a52c-90462cf542f4",
    slug: "ragnarok-m-classic",
    name: "Ragnarok M: Classic",
    sub_name: null,
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up untuk Ragnarok M: Classic dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/560b30945a42485b852b032d8eab48e31740036567.webp",
    publisher: "Gravity",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "75033b5d-d510-4d41-9853-b5367fe6ed70",
    slug: "sd-gundam-g-generation-eternal-gp",
    name: "SD Gundam G Generation ETERNAL",
    sub_name: null,
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up untuk SD Gundam G Generation ETERNAL dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/884de50befcb4dcca471932fd26168cf1744946104.webp",
    publisher: "Bandai Namco",
    is_available: true,
    is_featured: false,
    label: "22%OFF",
    delivery_type: "Kode Google Play",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "ad727347-d22e-4149-8357-69d9dd6ba590",
    slug: "crystal-of-atlan",
    name: "Crystal of Atlan",
    sub_name: "Asia",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up untuk Crystal of Atlan (Asia) dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/4c5a383bc4944e568ce381b04fada1e41749186342.webp",
    publisher: "Crystal Entertainment",
    is_available: true,
    is_featured: false,
    label: "13%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "9089d03f-8d19-4de9-b039-3a13c023c364",
    slug: "punishing-gray-raven",
    name: "Punishing: Gray Raven",
    sub_name: null,
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up untuk Punishing: Gray Raven dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/2bce838c41f74c8ab6b7fc75b02df8491743391079.webp",
    publisher: "Kuro Game",
    is_available: true,
    is_featured: false,
    label: "4%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "03eb0add-b96e-49cf-bc40-6d91021e8249",
    slug: "pokemon-tcg-pocket-gp",
    name: "Pokémon TCG Pocket",
    sub_name: null,
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up untuk Pokémon TCG Pocket dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/93ed92d787fa40c4851dc892687dc9241742369618.webp",
    publisher: "The Pokémon Company",
    is_available: true,
    is_featured: false,
    label: "25%OFF",
    delivery_type: "Kode Google Play",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
  {
    id: "74971b2e-edae-4f9f-a965-dadf10203ba0",
    slug: "identity-v",
    name: "Identity V",
    sub_name: "Global",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up Echoes untuk Identity V (Global) dengan cepat dan mudah.",
    image_url:
      "https://shop.ldrescdn.com/rms/ld-space/process/img/27472ed588a64370b5da848fcf335e4b1742365675.webp",
    publisher: "NetEase Games",
    is_available: true,
    is_featured: false,
    label: "14%OFF",
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.GAME,
  },
];

// Data seed untuk kategori Pulsa
export const seedPulsa = [
  {
    id: "98c62681-69e2-450f-91a4-ce303515cf51",
    slug: "telkomsel",
    name: "Telkomsel",
    sub_name: "Pulsa",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up pulsa Telkomsel dengan cepat dan mudah. Pastikan nomor telepon Anda benar dan tidak hangus.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227482MSEL.webp",
    publisher: "Telkomsel",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.PULSA,
  },
  {
    id: "f96a1cd4-4eec-4f8c-8600-e462bfdbb15a",
    slug: "byu",
    name: "byU",
    sub_name: "Pulsa",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up pulsa byU dengan cepat dan mudah.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227525.webp",
    publisher: "byU",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.PULSA,
  },
  {
    id: "8aa06389-d918-46b5-9f1b-362f1c21184e",
    slug: "tri",
    name: "Tri",
    sub_name: "Pulsa",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up pulsa Tri dengan cepat dan mudah. 3 (Tri) adalah salah satu operator seluler yang ada di Indonesia. Pastikan nomor telepon Anda benar dan tidak hangus.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227461.webp",
    publisher: "Tri",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.PULSA,
  },
  {
    id: "cb93f2fe-9a8b-4c35-b326-dc92dec11845",
    slug: "isat-pulsa",
    name: "Indosat",
    sub_name: "Pulsa",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up pulsa Indosat dengan cepat dan mudah. Indosat merupakan salah satu perusahaan penyedia jasa telekomunikasi dan jaringan telekomunikasi di Indonesia. Pastikan nomor telepon Anda benar dan tidak hangus.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1746965421AT.webp",
    publisher: "Indosat",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.PULSA,
  },
  {
    id: "00539fbe-dd47-4f57-a568-d85b2e7fe924",
    slug: "xl-pulsa",
    name: "XL",
    sub_name: "XL Axiata",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up pulsa XL dengan cepat dan mudah. XL Axiata adalah perusahaan telekomunikasi terkemuka di Indonesia. Pastikan nomor telepon Anda benar dan tidak hangus.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227145IATA.webp",
    publisher: "XL Axiata",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.PULSA,
  },
  {
    id: "ea592e38-16f3-4273-8742-eb5f2c43ba49",
    slug: "axis-pulsa",
    name: "Axis",
    sub_name: "Pulsa",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description: "Top-up pulsa Axis dengan cepat dan mudah.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227431.webp",
    publisher: "Axis",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.PULSA,
  },
  {
    id: "17d08cb9-e9a6-48f9-bda3-5a961b31e65d",
    slug: "smartfren",
    name: "Smartfren",
    sub_name: "Pulsa",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Top-up pulsa Smartfren dengan cepat dan mudah. PT Smartfren Telecom Tbk adalah operator penyedia jasa telekomunikasi berbasis teknologi 4G LTE Advanced. Pastikan nomor telepon Anda benar dan tidak hangus.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227504FREN.webp",
    publisher: "Smartfren",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Otomatis",
    is_seo_enabled: false,
    type: ProductCategoryType.PULSA,
  },
];

// Data seed untuk kategori Voucher
export const seedVoucher = [
  {
    id: "46b04b55-40d3-40db-b9eb-16a95782da9a",
    slug: "google-play-idr",
    name: "Google Play Gift Card",
    sub_name: "Voucher",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Google Play gift card pada dasarnya adalah voucher digital yang bisa kamu gunakan untuk melakukan berbagai pembelian di Google Play Store. Khusus Akun Google Region Indonesia.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227820E_PLAY_GIFT_CARD.webp",
    publisher: "Google",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Kode Voucher",
    is_seo_enabled: false,
    type: ProductCategoryType.VOUCHER,
  },
  {
    id: "13a79e8f-c60b-43e7-908c-25cbd2a9b521",
    slug: "garena-shells",
    name: "Garena Shells",
    sub_name: "Voucher",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Garena Shell adalah mata uang online di platform game Garena dan game-game yang dioperasikan Garena. Pemain Garena dapat menggunakan Garena Shell untuk membeli berbagai produk dan layanan, dan juga item-item dalam game.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227799A_SHELL.webp",
    publisher: "Garena",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Kode Voucher",
    is_seo_enabled: false,
    type: ProductCategoryType.VOUCHER,
  },
  {
    id: "83a436d9-9540-4045-a211-9cf2865a28d0",
    slug: "roblox",
    name: "Roblox Voucher",
    sub_name: "Voucher Robux",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Roblox adalah game semesta virtual terbaik yang mendorongmu untuk berkreasi, berbagi pengalaman dengan teman, dan menjadi apa saja sesuai imajinasimu. Gabung dengan jutaan orang dan temukan beragam dunia tak terhingga yang diciptakan oleh komunitas global! Masukkan NO HP dengan benar.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754233848X.webp",
    publisher: "Roblox Corporation",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Kode Voucher",
    is_seo_enabled: false,
    type: ProductCategoryType.VOUCHER,
  },
  {
    id: "f51f78f2-1ae4-4ea7-9599-70fc3e5ae5f3",
    slug: "playstation-store",
    name: "PlayStation Gift Card",
    sub_name: "Voucher",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "PlayStation™Store Gift Card adalah Voucher resmi dari SONY yang dapat digunakan untuk mengisi saldo wallet pada ID/Akun PSN Anda.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227853TATION.webp",
    publisher: "Sony Interactive Entertainment",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Kode Voucher",
    is_seo_enabled: false,
    type: ProductCategoryType.VOUCHER,
  },
  {
    id: "eaf91a35-161a-4662-9a44-3dccc7062e7e",
    slug: "steam-wallet-idr",
    name: "Steam Wallet Code",
    sub_name: "Voucher",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Steam Wallet merupakan alat pembayaran yang digunakan untuk berbelanja di Steam Store dalam bentuk uang virtual. Dengan Steam Wallet, kamu bisa membeli game dan item dalam game, serta software yang ada di Steam. Khusus Steam Wallet Region Indonesia.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754228118.webp",
    publisher: "Valve Corporation",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Kode Voucher",
    is_seo_enabled: false,
    type: ProductCategoryType.VOUCHER,
  },
  {
    id: "c6671582-b191-44a0-ba52-825b28688793",
    slug: "spotify",
    name: "Spotify",
    sub_name: "Spotify",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Spotify Premium Gift Card untuk menikmati musik streaming tanpa batas dengan kualitas audio terbaik.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227877FY_(1).webp",
    publisher: "Spotify",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Kode Voucher",
    is_seo_enabled: false,
    type: ProductCategoryType.VOUCHER,
  },
  {
    id: "84eaa3aa-3ce9-438c-8c23-dfa014061358",
    slug: "vidio",
    name: "Vidio",
    sub_name: "Voucher",
    banner_url:
      "https://www.lapakgaming.com/static/banner/lapakgaming/202507/EXP%20LG%20ID-1448x520-HB-Genshin-INEFFA%20CITLALI.png?tr=w-3840%2Cq-75",
    description:
      "Vidio adalah layanan video streaming dengan berbagai konten tv streaming, film, sinetron, original series dan olahraga.",
    image_url:
      "https://sin1.contabostorage.com/b1d79b8bbee7475eab6c15cd3d13cd4d:topupgamestore/p/1754227896.webp",
    publisher: "Vidio",
    is_available: true,
    is_featured: false,
    label: null,
    delivery_type: "Kode Voucher",
    is_seo_enabled: false,
    type: ProductCategoryType.VOUCHER,
  },
];

export const productCategorySeeds = async (dbInstance: typeof db) => {
  await dbInstance
    .insert(tb.productCategories)
    .values([...seedGame, ...seedPulsa, ...seedVoucher])
    .onConflictDoNothing();
};
