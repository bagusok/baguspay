import { ChevronRightIcon, LockIcon, MailIcon, PhoneIcon } from 'lucide-react'
import { useState } from 'react'
import BreadcrumbBasic from '~/components/breadcrumb-basic'
import ChangeEmailModal from './_change-email-modal'
import ChangePasswordModal from './_change-password-modal'
import ChangePhoneModal from './_change-phone-modal'

type ModalType = 'password' | 'email' | 'phone' | null

const SETTINGS_MENUS: {
  title: string
  description: string
  icon: any
  type: ModalType
}[] = [
  {
    title: 'Ubah Kata Sandi',
    description: 'Perbarui kata sandi untuk tingkatkan keamanan akun Anda',
    icon: LockIcon,
    type: 'password',
  },
  {
    title: 'Ubah Email',
    description: 'Ganti alamat email utama yang terhubung dengan akun Anda',
    icon: MailIcon,
    type: 'email',
  },
  {
    title: 'Ubah Nomor Telepon',
    description: 'Perbarui nomor WhatsApp / telepon yang aktif',
    icon: PhoneIcon,
    type: 'phone',
  },
]

export default function UserSettings() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // Handlers for form submissions (nanti diganti dengan integasi API Endpoint)

  return (
    <div className="space-y-6">
      <BreadcrumbBasic
        items={[
          {
            label: 'Home',
            href: '/',
          },
          {
            label: 'User',
            href: '/user',
          },
          {
            label: 'Settings',
          },
        ]}
      />

      <section>
        <h1 className="text-2xl font-bold mb-1">Pengaturan Akun</h1>
        <p className="text-muted-foreground text-sm">
          Kelola preferensi keamanan dan data kontak akun Anda.
        </p>
      </section>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden md:max-w-2xl">
        <div className="divide-y divide-border">
          {SETTINGS_MENUS.map((menu) => {
            const Icon = menu.icon
            return (
              <button
                key={menu.type}
                onClick={() => setActiveModal(menu.type)}
                className="flex items-center w-full text-left gap-4 p-4 hover:bg-secondary/50 focus:bg-secondary/50 transition-colors outline-none cursor-pointer group"
              >
                <div className="rounded-full bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium text-base text-foreground group-hover:text-primary transition-colors">
                    {menu.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{menu.description}</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            )
          })}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal Ubah Kata Sandi */}
      <ChangePasswordModal activeModal={activeModal} setActiveModal={setActiveModal} />

      {/* 2. Modal Ubah Email */}
      <ChangeEmailModal activeModal={activeModal} setActiveModal={setActiveModal} />

      {/* 3. Modal Ubah Nomor Telepon */}
      <ChangePhoneModal activeModal={activeModal} setActiveModal={setActiveModal} />
    </div>
  )
}
