import { Lock } from "lucide-react";
import { Link } from "react-router";

export default function PrivacyPolicy() {
  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            <Lock className="size-4" />
            Kebijakan Privasi
          </p>

          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Privasi Anda di Baguspay
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-3xl">
            Kami berkomitmen melindungi data pribadi Anda. Halaman ini
            menjelaskan informasi apa yang kami kumpulkan, bagaimana kami
            menggunakannya, dan pilihan yang Anda miliki.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Terakhir diperbarui: 9 Agustus 2025
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Content */}
      <section className="mt-10 space-y-8">
        <Block title="1. Ruang Lingkup">
          <p>
            Kebijakan ini berlaku untuk semua layanan Baguspay, termasuk situs
            web dan aplikasi. Dengan menggunakan layanan kami, Anda menyetujui
            praktik yang dijelaskan di sini serta{" "}
            <Link
              to="/terms-of-service"
              className="text-primary hover:underline"
            >
              Syarat & Ketentuan
            </Link>
            .
          </p>
        </Block>

        <Block title="2. Data yang Kami Kumpulkan">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Data identitas: nama, email, nomor telepon.</li>
            <li>
              Data akun/transaksi: ID pengguna, riwayat pesanan, metode
              pembayaran.
            </li>
            <li>Data teknis: alamat IP, perangkat, log aktivitas, cookie.</li>
            <li>
              Data yang Anda berikan secara sukarela melalui formulir/dukungan.
            </li>
          </ul>
        </Block>

        <Block title="3. Cara Kami Menggunakan Data">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Menyediakan dan memproses layanan topup/PPOB.</li>
            <li>Verifikasi, pencegahan penipuan, dan keamanan.</li>
            <li>Layanan pelanggan, notifikasi status, dan dukungan teknis.</li>
            <li>Peningkatan layanan, analitik, dan personalisasi.</li>
            <li>Kepatuhan hukum dan kewajiban kontraktual.</li>
          </ul>
        </Block>

        <Block title="4. Dasar Hukum Pemrosesan">
          <p>
            Kami memproses data berdasarkan: (a) pelaksanaan kontrak, (b)
            kepentingan sah untuk meningkatkan layanan dan mencegah
            penyalahgunaan, (c) persetujuan Anda pada kasus tertentu, dan (d)
            kepatuhan terhadap hukum.
          </p>
        </Block>

        <Block title="5. Cookie & Teknologi Serupa">
          <p>
            Kami menggunakan cookie/teknologi serupa untuk keperluan fungsional,
            analitik, dan peningkatan pengalaman. Anda dapat mengatur preferensi
            cookie melalui pengaturan browser Anda. Menonaktifkan cookie
            tertentu dapat memengaruhi fungsi layanan.
          </p>
        </Block>

        <Block title="6. Berbagi Data dengan Pihak Ketiga">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Mitra pembayaran dan penyedia layanan untuk memproses transaksi.
            </li>
            <li>Penyedia infrastruktur, analitik, dan dukungan operasional.</li>
            <li>Penegak hukum/regulator jika diwajibkan oleh hukum.</li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Kami tidak menjual data pribadi Anda.
          </p>
        </Block>

        <Block title="7. Keamanan Data">
          <p>
            Kami menerapkan langkah teknis dan organisasi yang wajar untuk
            melindungi data Anda. Namun, tidak ada metode transmisi atau
            penyimpanan yang sepenuhnya aman. Harap jaga kredensial Anda dan
            waspada terhadap penipuan.
          </p>
        </Block>

        <Block title="8. Retensi Data">
          <p>
            Kami menyimpan data selama diperlukan untuk memenuhi tujuan
            pengumpulan atau sebagaimana diwajibkan oleh hukum yang berlaku.
            Setelah itu, data akan dihapus atau dianonimkan dengan aman.
          </p>
        </Block>

        <Block title="9. Hak Anda">
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Akses, koreksi, dan pembaruan data.</li>
            <li>
              Keberatan atau pembatasan pemrosesan dalam kondisi tertentu.
            </li>
            <li>Penghapusan data sesuai ketentuan hukum.</li>
            <li>
              Penarikan persetujuan untuk pemrosesan berbasis persetujuan.
            </li>
          </ul>
          <p className="mt-2">
            Untuk menggunakan hak-hak tersebut, hubungi kami melalui halaman{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Kontak
            </Link>
            .
          </p>
        </Block>

        <Block title="10. Anak di Bawah Umur">
          <p>
            Layanan kami tidak ditujukan untuk anak di bawah usia yang
            disyaratkan oleh hukum setempat. Kami tidak dengan sengaja
            mengumpulkan data anak. Jika Anda percaya anak memberikan data
            kepada kami, hubungi kami untuk penghapusan.
          </p>
        </Block>

        <Block title="11. Transfer Internasional">
          <p>
            Data Anda dapat diproses di negara selain negara tempat Anda
            tinggal. Kami memastikan perlindungan yang memadai sesuai hukum yang
            berlaku untuk transfer tersebut.
          </p>
        </Block>

        <Block title="12. Perubahan Kebijakan">
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
            Perubahan material akan diberitahukan melalui situs/aplikasi.
            Lanjutkan penggunaan layanan berarti Anda menyetujui perubahan
            tersebut.
          </p>
        </Block>

        <Block title="13. Kontak">
          <p>
            Untuk pertanyaan tentang kebijakan ini, silakan hubungi kami melalui
            halaman{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Kontak
            </Link>
            .
          </p>
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
