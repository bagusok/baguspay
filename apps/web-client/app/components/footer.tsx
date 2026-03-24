import { Link } from 'react-router'

export default function FooterSection() {
  return (
    <footer className="bg-secondary mt-16 p-4">
      <div className="w-full md:max-w-7xl  mx-auto">
        <div className="w-full flex flex-col md:flex-row gap-8 md:gap-4">
          <div className="flex-1/2 mb-8 md:mb-0">
            <h2 className="text-xl font-bold text-center md:text-start text-foreground">
              Baguspay
            </h2>
            <p className="text-sm mt-2 text-muted-foreground text-center md:text-start max-w-full lg:max-w-2/3">
              Baguspay adalah platform top-up & pembayaran digital yang memudahkan pembelian pulsa,
              paket data, game voucher, dan layanan digital lainnya secara cepat, aman, dan
              transparan
            </p>
            <address className="not-italic mt-4 text-xs leading-relaxed text-muted-foreground text-center md:text-start max-w-full lg:max-w-2/3">
              Jl. Raya Bandung Durenan, Desa Gandong, Kec. Bandung,
              <br className="hidden md:block" />
              Kab. Tulungagung, Jawa Timur, Kode Pos 66274
            </address>

            <h2 className="font-semibold mt-8 text-center md:text-start text-foreground">
              Dapatkan Aplikasi
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start">
              <img
                src="/images/download-google-play.png"
                alt="gp"
                className="h-13 object-contain"
              />
              <img src="/images/download-app-store.png" alt="gp" className="h-9 object-contain" />
              <img
                src="/images/download-app-gallery.png"
                alt="gp"
                className="h-14 object-contain"
              />
            </div>
          </div>
          <div className="flex-1 mb-8 md:mb-0">
            <div className="flex flex-row gap-4 md:flex-col md:gap-0">
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">Menu</h2>
                <ul>
                  <li>
                    <Link to="/about" className="text-sm text-muted-foreground">
                      Tentang Kami
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-sm text-muted-foreground">
                      Kontak
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy" className="text-sm text-muted-foreground">
                      Kebijakan Privasi
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms-of-service" className="text-sm text-muted-foreground">
                      Syarat dan Ketentuan
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold md:mt-4 text-foreground">Lainnya</h2>
                <ul>
                  <li>
                    <Link to="/faq" className="text-sm text-muted-foreground">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-sm text-muted-foreground">
                      Dukungan
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-sm text-muted-foreground">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-sm text-muted-foreground">
                      Karir
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-row gap-4 md:flex-col md:gap-0">
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">Hubungi Kami</h2>
                <ul>
                  <li>
                    <Link to="/about" className="text-sm text-muted-foreground">
                      Masalah Transaksi
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-sm text-muted-foreground">
                      Gabung Reseller
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold md:mt-4 text-foreground">Social Media</h2>
                <ul>
                  <li>
                    <Link to="/faq" className="text-sm text-muted-foreground">
                      Instagram
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-sm text-muted-foreground">
                      Facebook
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-sm text-muted-foreground">
                      Tiktok
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-sm text-muted-foreground">
                      Twitter
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mt-10 text-center md:text-left">
          &copy; {new Date().getFullYear()} Baguspay. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
