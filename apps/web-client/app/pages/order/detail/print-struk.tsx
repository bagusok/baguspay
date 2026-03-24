import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { PrinterIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'

export type ReceiptData = {
  trxId: string
  date: string
  productName: string
  customerTarget: string
  sn: string
  basePrice: number
}

type Props = {
  data?: ReceiptData
}

export default function PrintStruk({ data }: Props) {
  // Default mock data jika digunakan tanpa props, agar layout terlihat saat development
  const receiptData = data || {
    trxId: 'TRX-1234567890',
    date: new Date().toLocaleString('id-ID'),
    productName: 'TELKOMSEL DATA 50RB',
    customerTarget: '081234567890',
    sn: '12345678901234567890',
    basePrice: 51200,
  }

  // State untuk harga admin/tambahan, user bebas mengedit sebelum cetak
  const [sellPrice, setSellPrice] = useState<number>(receiptData.basePrice + 2000)

  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Struk_${receiptData.trxId}`,
    pageStyle: `
      @page {
        size: 58mm auto;
        margin: 0mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full">
      {/* Panel Form Editor */}
      <div className="w-full md:w-1/2 space-y-6 p-6 border border-gray-200 dark:border-zinc-800 rounded-xl bg-card shadow-sm h-fit">
        <div>
          <h3 className="text-lg font-bold">Pengaturan Harga</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Atur harga jual pelanggan sebelum dicetak.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400">Harga Modal (Info)</Label>
            <Input
              disabled
              value={formatRupiah(receiptData.basePrice)}
              className="bg-muted/50 border-gray-200 dark:border-zinc-800 disabled:opacity-75"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellPrice" className="font-semibold">
              Harga Jual / Cetak (Rp)
            </Label>
            <Input
              id="sellPrice"
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(Number(e.target.value))}
              placeholder="Masukkan nominal"
              className="font-mono font-bold text-lg border-primary/50 focus:border-primary transition-colors bg-background"
            />
          </div>
        </div>

        <Button
          onClick={handlePrint}
          className="w-full gap-2 shadow-md hover:shadow-lg transition-all"
          size="lg"
        >
          <PrinterIcon className="w-5 h-5" />
          Cetak Struk Resolusi 58mm
        </Button>
      </div>

      {/* Panel Preview Struk */}
      <div className="w-full md:w-1/2 flex justify-center items-start bg-gray-100 dark:bg-zinc-900/50 p-6 md:p-8 rounded-xl overflow-x-auto min-w-[340px] border border-gray-100 dark:border-zinc-800 h-full">
        {/* Area Print yang dituju oleh useReactToPrint */}
        <div
          ref={contentRef}
          className="bg-white p-4 shadow-sm text-black"
          style={{
            width: '58mm', // Ukuran standar printer kasir bluetooth / thermal
            minHeight: '100mm',
            fontFamily: "monospace, 'Courier New', Courier",
            fontSize: '12px',
            lineHeight: '1.2',
            color: '#000',
          }}
        >
          {/* Header Toko */}
          <div className="text-center mb-3">
            <h2 className="font-bold text-base m-0">BAGUSPAY</h2>
            <p className="m-0 text-[10px]">Platform Pembayaran Digital</p>
          </div>

          <div className="border-b-[1.5px] border-dashed border-gray-400 mb-2 mt-2"></div>

          {/* Rincian Trx */}
          <div className="mb-2">
            <table className="w-full text-[11px]">
              <tbody>
                <tr>
                  <td className="w-1/3 align-top py-0.5">Waktu</td>
                  <td className="w-[5%] align-top py-0.5">:</td>
                  <td className="align-top text-right py-0.5">{receiptData.date}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Trx ID</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top text-right py-0.5 break-all">{receiptData.trxId}</td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Tujuan</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top text-right py-0.5 break-all">
                    {receiptData.customerTarget}
                  </td>
                </tr>
                <tr>
                  <td className="align-top py-0.5">Produk</td>
                  <td className="align-top py-0.5">:</td>
                  <td className="align-top text-right py-0.5">{receiptData.productName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-b-[1.5px] border-dashed border-gray-400 mb-2 mt-2"></div>

          {/* Serial Number */}
          <div className="mb-2 text-center">
            <p className="m-0 font-bold text-[11px]">SN / Ref / Token:</p>
            <p className="m-0 text-[11px] break-all leading-tight mt-1">{receiptData.sn || '-'}</p>
          </div>

          <div className="border-b-[1.5px] border-dashed border-gray-400 mb-2 mt-2"></div>

          {/* Total Harga */}
          <div className="mb-4 mt-2">
            <table className="w-full text-xs font-bold">
              <tbody>
                <tr>
                  <td className="align-top text-sm py-1">TOTAL</td>
                  <td className="align-top text-right text-sm py-1">{formatRupiah(sellPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer text */}
          <div className="border-t-[1.5px] border-dashed border-gray-400 pt-2 pb-2 text-center flex flex-col gap-1">
            <p className="m-0 font-bold text-xs">BERHASIL</p>
            <p className="m-0 text-[10px]">Terima kasih telah berbelanja.</p>
            <p className="m-0 text-[9px] mt-1 text-gray-700">
              Simpan struk ini sebagai bukti pembayaran yang sah.
            </p>
          </div>

          {/* Spacing biar bagian bawah tidak kepotong jika dirobek */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  )
}
