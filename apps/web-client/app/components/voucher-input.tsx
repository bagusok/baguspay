import { UserRole } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import {
  CheckCircleIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  LogInIcon,
  PercentIcon,
  TagIcon,
  XCircleIcon,
} from 'lucide-react'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router'
import type { InquiryForm } from '~/pages/order/slug'
import { userAtom } from '~/store/user'
import { apiClient } from '~/utils/axios'
import { formatPrice } from '~/utils/format'

interface VoucherData {
  id: string
  name: string
  code: string
  discount_percentage: number
  discount_static: number
  discount_maximum: number
  min_amount: number
}

interface VoucherInputProps {
  form: UseFormReturn<InquiryForm>
  productId: string
  productPrice?: number
}

export default function VoucherInput({ form, productId, productPrice = 0 }: VoucherInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [checkedVoucher, setCheckedVoucher] = useState<VoucherData | null>(null)
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherData | null>(null)

  const user = useAtomValue(userAtom)
  const isGuest = !user.data?.role || user.data.role === UserRole.GUEST

  const checkVoucher = useMutation({
    mutationKey: ['checkVoucher', productId],
    mutationFn: async (code: string) => {
      const response = await apiClient.post<{ success: boolean; data: VoucherData }>(
        '/offers/redeem-voucher',
        {
          code,
          product_id: productId,
        },
      )
      return response.data
    },
    onSuccess: (data) => {
      setCheckedVoucher(data.data)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Voucher tidak valid')
      setCheckedVoucher(null)
    },
  })

  const handleCheckVoucher = () => {
    if (!voucherCode.trim()) {
      toast.error('Masukkan kode voucher')
      return
    }

    if (!productId) {
      toast.error('Pilih produk terlebih dahulu')
      return
    }

    checkVoucher.mutate(voucherCode.trim().toUpperCase())
  }

  const handleApplyVoucher = () => {
    if (!checkedVoucher) return

    setAppliedVoucher(checkedVoucher)
    form.setValue('voucher_id', checkedVoucher.id)
    toast.success(`Voucher "${checkedVoucher.name}" berhasil diterapkan!`)
    setIsModalOpen(false)
    setCheckedVoucher(null)
    setVoucherCode('')
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setCheckedVoucher(null)
    setVoucherCode('')
    form.setValue('voucher_id', undefined)
    toast.success('Voucher dihapus')
  }

  const handleOpenModal = () => {
    if (!productId) {
      toast.error('Pilih produk terlebih dahulu')
      return
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCheckedVoucher(null)
    setVoucherCode('')
  }

  const calculateDiscount = (voucher: VoucherData): number => {
    if (productPrice < voucher.min_amount) return 0

    let discount = 0
    if (voucher.discount_percentage > 0) {
      discount = Math.floor(productPrice * (voucher.discount_percentage / 100))
    } else if (voucher.discount_static > 0) {
      discount = voucher.discount_static
    }

    if (voucher.discount_maximum > 0) {
      discount = Math.min(discount, voucher.discount_maximum)
    }

    return Math.max(0, Math.min(discount, productPrice))
  }

  const getDiscountLabel = (voucher: VoucherData): string => {
    if (voucher.discount_percentage > 0) {
      const label = `${voucher.discount_percentage}%`
      if (voucher.discount_maximum > 0) {
        return `${label} (maks. ${formatPrice(voucher.discount_maximum)})`
      }
      return label
    }
    return formatPrice(voucher.discount_static)
  }

  return (
    <>
      <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
        <div className="inline-flex gap-2 items-center">
          <div className="rounded-full p-2 bg-primary/40">
            <TagIcon className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold">Voucher</h2>
        </div>

        {appliedVoucher ? (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-400">
                    {appliedVoucher.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    Kode: {appliedVoucher.code}
                  </p>
                  {productPrice > 0 && (
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mt-1">
                      Hemat {formatPrice(calculateDiscount(appliedVoucher))}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveVoucher}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto"
              >
                <XCircleIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : isGuest ? (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-3">
              <LogInIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Login untuk menggunakan voucher
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Dapatkan diskon dengan kode promo
                </p>
              </div>
              <Link to="/auth/login">
                <Button type="button" size="sm" variant="outline" className="shrink-0">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenModal}
            className="w-full mt-4 justify-between p-3 h-auto border-dashed border-2 hover:border-primary/50 transition-all duration-200"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <TagIcon className="w-4 h-4" />
              <span>Masukkan kode voucher</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Gunakan Voucher
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="voucher_code_modal" className="sr-only">
                  Kode Voucher
                </Label>
                <Input
                  id="voucher_code_modal"
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase())
                    setCheckedVoucher(null)
                  }}
                  placeholder="Masukkan kode voucher"
                  className="uppercase"
                  disabled={checkVoucher.isPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCheckVoucher()
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckVoucher}
                disabled={checkVoucher.isPending || !voucherCode.trim()}
                className="shrink-0"
              >
                {checkVoucher.isPending ? (
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                ) : (
                  'Cek'
                )}
              </Button>
            </div>

            {checkVoucher.isError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4 shrink-0" />
                  {(checkVoucher.error as any)?.response?.data?.message ||
                    'Voucher tidak valid atau tidak dapat digunakan'}
                </p>
              </div>
            )}

            {checkedVoucher && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                    <PercentIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      {checkedVoucher.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                      Kode: {checkedVoucher.code}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-green-200 dark:border-green-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-400">Diskon</span>
                    <span className="font-medium text-green-800 dark:text-green-300">
                      {getDiscountLabel(checkedVoucher)}
                    </span>
                  </div>
                  {checkedVoucher.min_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 dark:text-green-400">Min. Pembelian</span>
                      <span className="font-medium text-green-800 dark:text-green-300">
                        {formatPrice(checkedVoucher.min_amount)}
                      </span>
                    </div>
                  )}
                  {productPrice > 0 && (
                    <div className="flex justify-between text-sm pt-2 border-t border-green-200 dark:border-green-700">
                      <span className="text-green-700 dark:text-green-400">Estimasi Hemat</span>
                      <span className="font-bold text-green-800 dark:text-green-300">
                        {formatPrice(calculateDiscount(checkedVoucher))}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={productPrice > 0 && productPrice < checkedVoucher.min_amount}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Pakai Voucher
                </Button>

                {productPrice > 0 && productPrice < checkedVoucher.min_amount && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                    Minimum pembelian {formatPrice(checkedVoucher.min_amount)} untuk menggunakan
                    voucher ini
                  </p>
                )}
              </div>
            )}

            {!checkedVoucher && !checkVoucher.isError && (
              <p className="text-xs text-muted-foreground text-center">
                Masukkan kode voucher dan klik "Cek" untuk memverifikasi
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
