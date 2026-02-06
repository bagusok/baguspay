# Digiflazz Sync Config

Config ini dipakai oleh:

- `update-products.ts`
- `update-single-product.ts`

## Contoh

```ts
export const syncConfig = {
  cookiesPath: 'cookies.json',
  categories: ['pulsa'],
  subCategoryTypeIds: ['all'],
  excludeProductCodes: [],
  updateMode: 'seller',
  perProduct: {},
  report: {
    enabled: true,
    path: 'reports',
  },
  autoFillProductCode: {
    enabled: true,
    prefix: 'BP',
    length: 10,
  },
  maxPrice: {
    mode: 'markup',
    markup: {
      amount: 200,
      perCode: {},
    },
  },
  onlyProblematic: false,
  problematicCriteria: {
    inactiveSeller: false,
    priceOverMax: false,
  },
  sellerFilter: {
    minRating: 4,
    minRatingSteps: [4.5, 4, 3.5],
    blacklist: [],
    requireActive: true,
    enforceMaxPrice: false,
  },
}
```

## Field

### cookiesPath

Path file cookies (relatif dari folder `example`).

### categories

Filter kategori. Isi `['all']` untuk semua kategori. Bisa pakai id atau nama kategori.

### subCategoryTypeIds

Filter brand (sub category) berdasarkan **nama brand** atau id brand. Isi `['all']` untuk semua brand.

### excludeProductCodes

Daftar kode produk (kode internal) yang tidak ikut auto update.

### updateMode

Mode update default untuk semua produk:

- `seller`: update seller + harga.
- `price-only`: hanya update `price` dan `max_price`, seller tetap.

### perProduct

Override per produk berdasarkan kode internal.

Contoh:

```ts
perProduct: {
  BP001: {
    updateMode: 'price-only',
    preferredSellers: ['SELLER A', 'SELLER B'],
    allowedSellerSkuCodes: ['SKU001', 'SKU002'],
  },
}
```

Field per product:

- `updateMode`: override mode per produk.
- `preferredSellers`: daftar nama seller preferensi (urut prioritas).
- `allowedSellerSkuCodes`: hanya izinkan seller dengan `seller_sku_code` tertentu.

### report

Atur apakah report disimpan ke file.

- `enabled`: `true/false`
- `path`: folder output report (relatif dari folder `example`)

### autoFillProductCode

Isi otomatis kode produk jika kosong.

Opsi:

- `true`/`false`
- Object:
  - `enabled`: aktif/nonaktif
  - `prefix`: prefix kode random
  - `length`: panjang random (minimal 6)

Jika kode kosong, akan dibuat random unik dengan format `${prefix}${random}`.

### maxPrice

Pengaturan max price saat update.

#### mode

- `same`: `max_price` diset sama dengan harga seller terbaru.
- `markup`: `max_price = harga + markup`.

#### markup

- `amount`: markup default untuk semua produk.
- `perCode`: override markup per kode produk (kode dari sistem kita).

Contoh:

```ts
maxPrice: {
  mode: 'markup',
  markup: {
    amount: 200,
    perCode: {
      BP001: 500,
      BP002: 1000,
    },
  },
}
```

### onlyProblematic

Jika `true`, hanya update produk yang bermasalah.

### problematicCriteria

- `inactiveSeller`: seller tidak aktif.
- `priceOverMax`: harga produk lebih besar dari `max_price`.

### sellerFilter

- `minRating`: minimal rating seller (fallback lama).
- `minRatingSteps`: daftar rating fallback. Script akan coba urutan rating dari tinggi ke rendah.
- `blacklist`: seller yang diblok.
- `requireActive`: hanya seller aktif.
- `enforceMaxPrice`: seller harus <= max_price (jika true).
