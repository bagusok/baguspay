export interface DigiFlazzPriceListParams {
  cmd: "prepaid" | "pasca";
  code?: string;
  category?: string;
  brand?: string;
  type?: string;
}

export interface DigiFlazzProduct {
  /** Nama produk */
  product_name: string;

  /** Kategori produk */
  category: string;

  /** Merek produk */
  brand: string;

  /** Tipe produk */
  type: string;

  /** Nama seller */
  seller_name: string;

  /** Harga untuk buyer */
  price: number;

  /** Kode SKU untuk buyer */
  buyer_sku_code: string;

  /** Status produk di sisi buyer */
  buyer_product_status: boolean;

  /** Status produk di sisi seller */
  seller_product_status: boolean;

  /** Apakah stok unlimited */
  unlimited_stock: boolean;

  /** Jumlah stok tersedia */
  stock: number;

  /** Apakah bisa multi purchase */
  multi: boolean;

  /** Jam mulai cut off (format HH:mm) */
  start_cut_off: string;

  /** Jam akhir cut off (format HH:mm) */
  end_cut_off: string;

  /** Deskripsi produk */
  desc: string;
}

export interface DigiFlazzPriceListResponse {
  data: DigiFlazzProduct[];
}
