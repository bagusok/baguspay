<h1 align="center">Baguspay</h1>

<p align='center'>Baguspay adalah platform Top Up Game & PPOB (Payment Point Online Bank) modern yang dirancang untuk memberikan pengalaman transaksi digital yang cepat, aman, dan responsif.  
Dibangun dengan arsitektur **monorepo menggunakan Turborepo, menggabungkan kekuatan NestJS, React Router v7, dan AdonisJS dalam satu ekosistem pengembangan yang efisien.</p>

<!-- Image Heres -->

## 🚀 Tech Stack

| Layer          | Framework                                   | Deskripsi                                                       |
| -------------- | ------------------------------------------- | --------------------------------------------------------------- |
| 🧠 Backend API | [NestJS](https://nestjs.com/)               | Backend utama untuk RESTful API & integrasi layanan topup/PPOB  |
| 🌐 Web Client  | [React Router v7](https://reactrouter.com/) | Frontend modern untuk pengguna akhir (customer portal)          |
| 🛠️ Admin Panel | [AdonisJS](https://adonisjs.com/)           | Monolit untuk panel admin dan manajemen konten                  |
| ⚡ Monorepo    | [Turborepo](https://turbo.build/)           | Pengelola workspace untuk efisiensi build, lint, dan deployment |

---

## 🏗️ Struktur Proyek

```
baguspay
|-- README.md
|-- apps
|   |-- web-admin
|   |   |-- ace.js
|   |   |-- adonisrc.ts
|   |   |-- app
|   |   |-- bin
|   |   |-- config
|   |   |-- eslint.config.js
|   |   |-- inertia
|   |   |-- package.json
|   |   |-- resources
|   |   |-- start
|   |   |-- tests
|   |   |-- tsconfig.json
|   |   `-- vite.config.ts
|   |-- web-api
|   |   |-- README.md
|   |   |-- eslint.config.mjs
|   |   |-- nest-cli.json
|   |   |-- package-lock.json
|   |   |-- package.json
|   |   |-- src
|   |   |-- test
|   |   |-- tsconfig.build.json
|   |   `-- tsconfig.json
|   `-- web-client
|       |-- Dockerfile
|       |-- README.md
|       |-- app
|       |-- package.json
|       |-- public
|       |-- react-router.config.ts
|       |-- tsconfig.json
|       `-- vite.config.ts
|-- cli
|   `-- digiflazz
|       |-- package.json
|       |-- src
|       `-- tsconfig.json
|-- package.json
|-- packages
|   |-- db
|   |   |-- drizzle
|   |   |-- drizzle.config.ts
|   |   |-- eslint.config.js
|   |   |-- package.json
|   |   |-- scripts
|   |   |-- src
|   |   |-- tsconfig.json
|   |   `-- tsup.config.ts
|   |-- eslint-config
|   |   |-- README.md
|   |   |-- base.js
|   |   |-- next.js
|   |   |-- package.json
|   |   `-- react-internal.js
|   |-- tailwind-config
|   |   |-- global.css
|   |   `-- package.json
|   |-- typescript-config
|   |   |-- base.json
|   |   |-- nextjs.json
|   |   |-- package.json
|   |   |-- react-library.json
|   |   `-- react-router.json
|   `-- ui
|       |-- README.md
|       |-- components.json
|       |-- eslint.config.js
|       |-- package.json
|       |-- postcss.config.mjs
|       |-- src
|       |-- tsconfig.json
|       `-- tsup.config.ts
|-- pnpm-lock.yaml
|-- pnpm-workspace.yaml
|-- turbo.json

```

---

## ⚙️ Fitur Utama

### 🕹️ Untuk Pengguna

- Top Up berbagai game populer (Mobile Legends, Free Fire, PUBG, dll)
- Pembayaran PPOB: Pulsa, Token PLN, PDAM, Internet, eMoney, dan lainnya
- Riwayat transaksi real-time
- Integrasi pembayaran otomatis (VA, QRIS, eWallet)
- Notifikasi status transaksi

### 🧑‍💼 Untuk Admin

- Dashboard transaksi dan penjualan
- Manajemen produk & harga
- Manajemen user & role
- Monitoring sistem & laporan keuangan
- Kelola promo dan voucher

---

## 🧩 Instalasi & Pengembangan

### 1. Clone Repositori

```bash
git clone https://github.com/username/baguspay.git
cd baguspay
```

### 2. Instal Dependensi

```bash
pnpm install
```

### 3. Jalankan Semua Aplikasi

```bash
pnpm dev
```

> Turborepo akan menjalankan semua aplikasi (`web`, `api`, dan `admin`) secara paralel dengan hot reload.

---

## 🔧 Environment Variables

Buat file `.env` di masing-masing folder aplikasi (`/apps/web-api`, `/apps/web-admin`, `/apps/web-client`).

## 🧱 Script Umum

| Perintah     | Deskripsi                                          |
| ------------ | -------------------------------------------------- |
| `pnpm dev`   | Menjalankan semua aplikasi dalam mode pengembangan |
| `pnpm build` | Build semua aplikasi untuk production              |
| `pnpm lint`  | Jalankan linting untuk seluruh workspace           |
| `pnpm test`  | Jalankan unit test seluruh project                 |

---

## 🧰 Build Manual (Opsional)

### Web

```bash
cd apps/web-client
pnpm dev
```

### API

```bash
cd apps/web-api
pnpm start:dev
```

### Admin

```bash
cd apps/web-admin
node ace serve --watch
```

---

## 📦 Deployment

| Aplikasi             | Platform Rekomendasi                |
| -------------------- | ----------------------------------- |
| **Web (React)**      | Vercel / Netlify / Cloudflare Pages |
| **API (NestJS)**     | Render / Railway / VPS / Docker     |
| **Admin (AdonisJS)** | VPS / PM2 / Docker                  |

---

> 💡 _"Baguspay — top up game & PPOB semudah klik!"_
