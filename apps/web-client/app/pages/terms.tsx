import { ShieldCheck } from "lucide-react";
import { Link } from "react-router";

export default function Terms() {
  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <ShieldCheck className="size-4" />
            Kebijakan Penggunaan Layanan
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Syarat & Ketentuan Baguspay
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Terima kasih telah menggunakan Baguspay. Harap baca Syarat &
            Ketentuan ini dengan saksama sebelum menggunakan layanan kami.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Terakhir diperbarui: 9 Agustus 2025
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Content */}
      <section className="mt-10 space-y-8">
        <Block title="1. Penerimaan Syarat">
          <p>
            Dengan mengakses dan/atau menggunakan situs, aplikasi, dan layanan
            Baguspay, Anda menyatakan telah membaca, memahami, menyetujui, dan
            terikat pada Syarat & Ketentuan ini beserta kebijakan lain yang
            menjadi bagian tidak terpisahkan, termasuk{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Kebijakan Privasi
            </Link>
            .
          </p>
        </Block>

        <Block title="2. Perubahan Syarat">
          <p>
            Baguspay dapat mengubah Syarat & Ketentuan ini dari waktu ke waktu.
            Versi terbaru akan ditampilkan di halaman ini dengan tanggal
            pembaruan. Lanjutan penggunaan Anda setelah perubahan berarti Anda
            menyetujui perubahan tersebut.
          </p>
        </Block>

        <Block title="3. Akun Pengguna">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Anda wajib memberikan informasi yang benar, akurat, dan terbaru.
            </li>
            <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun.</li>
            <li>
              Aktivitas yang terjadi pada akun Anda menjadi tanggung jawab Anda.
            </li>
            <li>
              Baguspay dapat menangguhkan/menutup akun yang melanggar kebijakan.
            </li>
          </ul>
        </Block>

        <Block title="4. Transaksi dan Pemesanan">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Pastikan data pesanan (ID game/nomor tujuan/nominal) sudah benar.
            </li>
            <li>
              Kesalahan input yang dilakukan pengguna bukan tanggung jawab
              Baguspay.
            </li>
            <li>Pesanan diproses otomatis; waktu proses dapat bervariasi.</li>
            <li>
              Kami berhak menolak/membatalkan pesanan mencurigakan atau
              melanggar.
            </li>
          </ul>
        </Block>

        <Block title="5. Produk Digital & Pengiriman">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Produk berupa barang digital (saldo, voucher, topup, dsb.).</li>
            <li>
              Pengiriman dilakukan secara elektronik ke akun/ID/nomor yang Anda
              masukkan.
            </li>
            <li>
              Status berhasil/selesai merujuk pada konfirmasi sistem/mitra kami.
            </li>
          </ul>
        </Block>

        <Block title="6. Harga, Biaya, dan Promo">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Harga dapat berubah sewaktu-waktu mengikuti kondisi pasar/mitra.
            </li>
            <li>
              Biaya layanan/pembayaran tertentu mungkin berlaku dan
              diinformasikan.
            </li>
            <li>
              Promo bersifat terbatas, mengikuti syarat spesifik yang berlaku.
            </li>
          </ul>
        </Block>

        <Block title="7. Pembayaran">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Dukungan metode pembayaran: e-wallet, VA, retail, kartu, dan
              lainnya.
            </li>
            <li>Pesanan diproses setelah pembayaran terkonfirmasi.</li>
            <li>
              Transaksi yang terindikasi penipuan akan dibatalkan secara
              sepihak.
            </li>
          </ul>
        </Block>

        <Block title="8. Refund & Pembatalan">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Refund hanya berlaku pada kondisi tertentu (mis. saldo belum
              masuk, stok habis, kegagalan dari mitra) sesuai hasil investigasi.
            </li>
            <li>Pengajuan refund wajib disertai bukti yang diperlukan.</li>
            <li>
              Waktu proses refund mengikuti kebijakan metode pembayaran terkait.
            </li>
          </ul>
        </Block>

        <Block title="9. Batasan Tanggung Jawab">
          <p>
            Baguspay tidak bertanggung jawab atas kerugian tidak langsung,
            insidental, khusus, konsekuensial, atau hukuman yang timbul dari
            penggunaan layanan. Tanggung jawab maksimal (jika ada) dibatasi pada
            nilai transaksi terkait.
          </p>
        </Block>

        <Block title="10. Larangan Penggunaan">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Penyalahgunaan layanan untuk aktivitas ilegal/penipuan.</li>
            <li>Upaya meretas, memanipulasi data, atau mengganggu layanan.</li>
            <li>Pelanggaran hak kekayaan intelektual pihak manapun.</li>
          </ul>
        </Block>

        <Block title="11. Kekayaan Intelektual">
          <p>
            Seluruh konten, merek, logo, dan materi dalam platform merupakan
            milik Baguspay atau pemilik lisensi terkait dan dilindungi hukum
            yang berlaku.
          </p>
        </Block>

        <Block title="12. Privasi">
          <p>
            Penggunaan layanan juga diatur oleh{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Kebijakan Privasi
            </Link>
            . Harap meninjau kebijakan tersebut untuk memahami bagaimana kami
            mengelola data Anda.
          </p>
        </Block>

        <Block title="13. Dukungan & Kontak">
          <p>
            Jika Anda memiliki pertanyaan terkait Syarat & Ketentuan ini,
            silakan hubungi kami melalui halaman{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Kontak
            </Link>
            .
          </p>
        </Block>

        <Block title="14. Hukum yang Berlaku">
          <p>
            Syarat & Ketentuan ini tunduk pada hukum yang berlaku di wilayah
            Republik Indonesia. Setiap perselisihan akan diselesaikan di
            yurisdiksi yang ditentukan oleh Baguspay.
          </p>
        </Block>

        <Block title="15. Lain-lain">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Jika ada ketentuan yang tidak dapat diberlakukan, ketentuan
              lainnya tetap berlaku.
            </li>
            <li>
              Kegagalan untuk menegakkan suatu hak tidak dianggap sebagai
              pengesampingan hak.
            </li>
          </ul>
        </Block>
      </section>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 md:p-6">
      <h2 className="text-base md:text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-2 text-sm leading-6 text-foreground/90">
        {children}
      </div>
    </div>
  );
}
