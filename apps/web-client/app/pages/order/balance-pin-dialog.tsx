import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { Label } from '@repo/ui/components/ui/label'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

type BalancePinDialogProps = {
  open: boolean
  initialPin?: string
  isLoading?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (pin: string) => void
}

const PIN_LENGTH = 6

export default function BalancePinDialog({
  open,
  initialPin = '',
  isLoading = false,
  onOpenChange,
  onConfirm,
}: BalancePinDialogProps) {
  const [pinDigits, setPinDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''))
  const pinRefs = useRef<Array<HTMLInputElement | null>>([])
  const pinSlots = useMemo(() => Array.from({ length: PIN_LENGTH }, (_, i) => `pin-${i}`), [])

  useEffect(() => {
    if (open) {
      const digits = initialPin.replace(/\D/g, '').slice(0, PIN_LENGTH).split('')
      const next = Array(PIN_LENGTH).fill('') as string[]
      digits.forEach((d, i) => {
        next[i] = d
      })
      setPinDigits(next)
      setTimeout(() => pinRefs.current[0]?.focus(), 0)
    } else {
      setPinDigits(Array(PIN_LENGTH).fill(''))
    }
  }, [open, initialPin])

  const focusField = (index: number) => {
    if (index >= 0 && index < PIN_LENGTH) {
      pinRefs.current[index]?.focus()
    }
  }

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1)
    setPinDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      if (digit && index < PIN_LENGTH - 1) {
        focusField(index + 1)
      }
      return next
    })
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !pinDigits[index] && index > 0) {
      focusField(index - 1)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH)
    const next = Array(PIN_LENGTH).fill('') as string[]
    pasted.split('').forEach((d, i) => {
      next[i] = d
    })
    setPinDigits(next)
    focusField(Math.min(pasted.length, PIN_LENGTH - 1))
  }

  const handleConfirm = () => {
    const pinValue = pinDigits.join('')
    if (pinValue.length !== PIN_LENGTH) {
      toast.error('PIN saldo harus 6 digit')
      return
    }
    onConfirm(pinValue)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Masukkan PIN Saldo</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="balance_pin" className="text-sm">
            PIN Saldo
          </Label>
          <div className="flex items-center justify-between gap-2" id="balance_pin">
            {pinSlots.map((slotId, index) => (
              <input
                key={slotId}
                ref={(el) => {
                  pinRefs.current[index] = el
                }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                className="w-10 h-12 text-center text-lg font-semibold bg-transparent border-b-2 border-slate-300 focus:border-primary outline-none"
                value={pinDigits[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Masukkan 6 digit PIN saldo Anda.</p>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Konfirmasi PIN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
