import { useForm } from '@inertiajs/react'
import { useState, FormEvent, useEffect } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { UpdatePaymentMethodsValidator } from '#validators/payments'
import {
  PaymentMethodAllowAccess,
  PaymentMethodFeeType,
  PaymentMethodProvider,
  PaymentMethodType,
} from '@repo/db/types'

import FileManager from '~/components/file-manager'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '~/utils/axios'

type Props = {
  paymentMethodId: string
}

export function EditPaymentMethodModal({ paymentMethodId }: Props) {
  const [open, setOpen] = useState(false)
  const form = useForm<UpdatePaymentMethodsValidator>({
    name: '',
    image_id: '',
    fee_static: 0,
    fee_percentage: 0,
    fee_type: PaymentMethodFeeType.MERCHANT,
    is_available: false,
    is_featured: false,
    label: '',
    provider_name: PaymentMethodProvider.TRIPAY,
    provider_code: '',
    min_amount: 0,
    max_amount: 0,
    type: PaymentMethodType.VIRTUAL_ACCOUNT,
    allow_access: [] as PaymentMethodAllowAccess[],
    expired_in: 0,
    cut_off_start: '00:00',
    cut_off_end: '00:00',
    is_need_phone_number: false,
    is_need_email: false,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    form.patch(`/admin/payments/methods/${paymentMethodId}`, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const getPaymentMethod = useMutation({
    mutationKey: ['getPaymentMethod', paymentMethodId],
    mutationFn: async () =>
      apiClient.get(`/admin/payments/methods/${paymentMethodId}`).then((res) => {
        const d = res.data.data
        form.setData({
          name: d.name,
          allow_access: d.allow_access,
          image_id: d.image_id || '',
          fee_static: d.fee_static,
          fee_percentage: d.fee_percentage,
          fee_type: d.fee_type,
          cut_off_end: d.cut_off_end || '00:00',
          cut_off_start: d.cut_off_start || '00:00',
          is_available: d.is_available,
          is_featured: d.is_featured,
          expired_in: d.expired_in,
          is_need_email: d.is_need_email,
          is_need_phone_number: d.is_need_phone_number,
          label: d.label || '',
          max_amount: d.max_amount,
          min_amount: d.min_amount,
          payment_method_category_id: d.payment_method_category_id,
          provider_code: d.provider_code || '',
          provider_name: d.provider_name,
          type: d.type,
        })
        return res.data
      }),
  })

  useEffect(() => {
    if (open) {
      getPaymentMethod.mutate()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        {getPaymentMethod.isPending && <p className="text-center">Loading....</p>}
        {getPaymentMethod.isError && (
          <p className="text-red-500 text-center">Failed to load payment method</p>
        )}
        {getPaymentMethod.isSuccess && (
          <>
            <form className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="image_id" className="mb-2">
                  Image
                </Label>
                <FileManager
                  onFilesSelected={(f) => form.setData('image_id', f.id)}
                  defaultFileId={getPaymentMethod.data.data.image_id}
                />
                {form.errors.image_id && (
                  <div className="text-red-500 text-xs mt-1">{form.errors.image_id}</div>
                )}
              </div>
              <div>
                <Label htmlFor="name" className="mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={form.data.name}
                  onChange={(e) => form.setData('name', e.target.value)}
                  required
                />
                {form.errors.name && (
                  <div className="text-red-500 text-xs mt-1">{form.errors.name}</div>
                )}
              </div>
              <div>
                <Label htmlFor="category" className="mb-2">
                  Category
                </Label>
                <Select
                  value={form.data.payment_method_category_id}
                  onValueChange={(v) => form.setData('payment_method_category_id', v)}
                  required
                >
                  <SelectTrigger className="w-full" id="category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getPaymentMethod.data.categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.payment_method_category_id && (
                  <div className="text-red-500 text-xs mt-1">
                    {form.errors.payment_method_category_id}
                  </div>
                )}
              </div>

              {/* Fee Static & Fee Percentage */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="fee_static" className="mb-2">
                    Fee Static
                  </Label>
                  <Input
                    id="fee_static"
                    type="number"
                    placeholder="Fee Static"
                    value={form.data.fee_static}
                    onChange={(e) => form.setData('fee_static', Number(e.target.value))}
                    required
                  />
                  {form.errors.fee_static && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.fee_static}</div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="fee_percentage" className="mb-2">
                    Fee Percentage
                  </Label>
                  <Input
                    id="fee_percentage"
                    type="number"
                    placeholder="Fee Percentage"
                    value={form.data.fee_percentage}
                    onChange={(e) => form.setData('fee_percentage', Number(e.target.value))}
                    required
                  />
                  {form.errors.fee_percentage && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.fee_percentage}</div>
                  )}
                </div>
              </div>

              {/* Fee Type & Type */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="fee_type" className="mb-2">
                    Fee Type
                  </Label>
                  <Select
                    value={form.data.fee_type}
                    onValueChange={(v) => form.setData('fee_type', v as PaymentMethodFeeType)}
                    required
                  >
                    <SelectTrigger className="w-full" id="fee_type">
                      <SelectValue placeholder="Fee Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentMethodFeeType).map((ft) => (
                        <SelectItem key={ft} value={ft}>
                          {ft}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.errors.fee_type && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.fee_type}</div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="type" className="mb-2">
                    Type
                  </Label>
                  <Select
                    value={form.data.type}
                    onValueChange={(v) => form.setData('type', v as PaymentMethodType)}
                    required
                  >
                    <SelectTrigger className="w-full" id="type">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentMethodType).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.errors.type && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.type}</div>
                  )}
                </div>
              </div>

              {/* Provider Name & Provider Code */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="provider_name" className="mb-2">
                    Provider Name
                  </Label>
                  <Select
                    value={form.data.provider_name}
                    onValueChange={(v) => form.setData('provider_name', v as PaymentMethodProvider)}
                    required
                  >
                    <SelectTrigger className="w-full" id="provider_name">
                      <SelectValue placeholder="Provider Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentMethodProvider).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.errors.provider_name && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.provider_name}</div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="provider_code" className="mb-2">
                    Provider Code
                  </Label>
                  <Input
                    id="provider_code"
                    placeholder="Provider Code"
                    value={form.data.provider_code}
                    onChange={(e) => form.setData('provider_code', e.target.value)}
                    required
                  />
                  {form.errors.provider_code && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.provider_code}</div>
                  )}
                </div>
              </div>

              {/* Min Amount & Max Amount */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="min_amount" className="mb-2">
                    Min Amount
                  </Label>
                  <Input
                    id="min_amount"
                    type="number"
                    placeholder="Min Amount"
                    value={form.data.min_amount}
                    onChange={(e) => form.setData('min_amount', Number(e.target.value))}
                    required
                  />
                  {form.errors.min_amount && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.min_amount}</div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="max_amount" className="mb-2">
                    Max Amount
                  </Label>
                  <Input
                    id="max_amount"
                    type="number"
                    placeholder="Max Amount"
                    value={form.data.max_amount}
                    onChange={(e) => form.setData('max_amount', Number(e.target.value))}
                    required
                  />
                  {form.errors.max_amount && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.max_amount}</div>
                  )}
                </div>
              </div>

              {/* Status & Options */}
              <div className="flex flex-wrap gap-4 items-center">
                <Label className="flex items-center gap-1" htmlFor="is_available">
                  <input
                    id="is_available"
                    type="checkbox"
                    checked={form.data.is_available}
                    onChange={(e) => form.setData('is_available', e.target.checked)}
                  />
                  Available
                </Label>
                <Label className="flex items-center gap-1" htmlFor="is_featured">
                  <input
                    id="is_featured"
                    type="checkbox"
                    checked={form.data.is_featured}
                    onChange={(e) => form.setData('is_featured', e.target.checked)}
                  />
                  Featured
                </Label>
                <Label className="flex items-center gap-1" htmlFor="is_need_phone_number">
                  <input
                    id="is_need_phone_number"
                    type="checkbox"
                    checked={form.data.is_need_phone_number}
                    onChange={(e) => form.setData('is_need_phone_number', e.target.checked)}
                  />
                  Need Phone Number
                </Label>
                <Label className="flex items-center gap-1" htmlFor="is_need_email">
                  <input
                    id="is_need_email"
                    type="checkbox"
                    checked={form.data.is_need_email}
                    onChange={(e) => form.setData('is_need_email', e.target.checked)}
                  />
                  Need Email
                </Label>
                {form.errors.is_available && (
                  <div className="text-red-500 text-xs mt-1">{form.errors.is_available}</div>
                )}
                {form.errors.is_featured && (
                  <div className="text-red-500 text-xs mt-1">{form.errors.is_featured}</div>
                )}
                {form.errors.is_need_phone_number && (
                  <div className="text-red-500 text-xs mt-1">
                    {form.errors.is_need_phone_number}
                  </div>
                )}
                {form.errors.is_need_email && (
                  <div className="text-red-500 text-xs mt-1">{form.errors.is_need_email}</div>
                )}
              </div>

              {/* Allow Access */}
              <div>
                <Label className="block mb-2">Allow Access</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(PaymentMethodAllowAccess).map((a) => (
                    <Label
                      key={a}
                      className="flex items-center gap-1"
                      htmlFor={`allow_access_${a}`}
                    >
                      <input
                        id={`allow_access_${a}`}
                        type="checkbox"
                        checked={(form.data.allow_access ?? []).includes(a)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            form.setData('allow_access', [
                              ...(form.data.allow_access ?? []),
                              a as PaymentMethodAllowAccess,
                            ])
                          } else {
                            form.setData(
                              'allow_access',
                              (form.data.allow_access ?? []).filter((val) => val !== a)
                            )
                          }
                        }}
                      />
                      {a}
                    </Label>
                  ))}
                </div>
                {form.errors.allow_access && (
                  <div className="text-red-500 text-xs mt-1">{form.errors.allow_access}</div>
                )}
              </div>

              <div>
                <Label htmlFor="expired_in" className="mb-2">
                  Expired In (seconds)
                </Label>
                <Input
                  id="expired_in"
                  type="number"
                  placeholder="Expired In"
                  value={form.data.expired_in}
                  onChange={(e) => form.setData('expired_in', Number(e.target.value))}
                  required
                />
                {form.errors.expired_in && (
                  <div className="text-red-500 text-xs mt-1">{form.errors.expired_in}</div>
                )}
              </div>

              {/* Cut Off Start & End */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="cut_off_start" className="mb-2">
                    Cut Off Start
                  </Label>
                  <Input
                    id="cut_off_start"
                    type="time"
                    placeholder="Cut Off Start"
                    value={form.data.cut_off_start}
                    onChange={(e) => form.setData('cut_off_start', e.target.value)}
                  />
                  {form.errors.cut_off_start && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.cut_off_start}</div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="cut_off_end" className="mb-2">
                    Cut Off End
                  </Label>
                  <Input
                    id="cut_off_end"
                    type="time"
                    placeholder="Cut Off End"
                    value={form.data.cut_off_end}
                    onChange={(e) => form.setData('cut_off_end', e.target.value)}
                  />
                  {form.errors.cut_off_end && (
                    <div className="text-red-500 text-xs mt-1">{form.errors.cut_off_end}</div>
                  )}
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} type="submit" size="sm" disabled={form.processing}>
                {form.processing ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
