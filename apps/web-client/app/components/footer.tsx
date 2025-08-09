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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa
              ipsa minima facilis numquam, qui aliquid asperiores, voluptatibus
              deleniti fuga corporis tempore cum voluptas? Beatae, porro!
            </p>

            <h2 className="font-semibold mt-8 text-center md:text-start text-foreground">
              Dapatkan Aplikasi
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start">
              <img
                src="/images/download-google-play.png"
                alt="gp"
                className="h-13 object-contain"
              />
              <img
                src="/images/download-app-store.png"
                alt="gp"
                className="h-9 object-contain"
              />
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
                    <a href="/about" className="text-sm text-muted-foreground">
                      Tentang Kami
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="text-sm text-muted-foreground"
                    >
                      Kontak
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy-policy"
                      className="text-sm text-muted-foreground"
                    >
                      Kebijakan Privasi
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms-of-service"
                      className="text-sm text-muted-foreground"
                    >
                      Syarat dan Ketentuan
                    </a>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold md:mt-4 text-foreground">
                  Lainnya
                </h2>
                <ul>
                  <li>
                    <a href="/faq" className="text-sm text-muted-foreground">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="/support"
                      className="text-sm text-muted-foreground"
                    >
                      Dukungan
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="text-sm text-muted-foreground">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="/careers"
                      className="text-sm text-muted-foreground"
                    >
                      Karir
                    </a>
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
                    <a href="/about" className="text-sm text-muted-foreground">
                      Masalah Transaksi
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="text-sm text-muted-foreground"
                    >
                      Gabung Reseller
                    </a>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold md:mt-4 text-foreground">
                  Social Media
                </h2>
                <ul>
                  <li>
                    <a href="/faq" className="text-sm text-muted-foreground">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="/support"
                      className="text-sm text-muted-foreground"
                    >
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="text-sm text-muted-foreground">
                      Tiktok
                    </a>
                  </li>
                  <li>
                    <a
                      href="/careers"
                      className="text-sm text-muted-foreground"
                    >
                      Twitter
                    </a>
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
  );
}
