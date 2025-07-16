import { router } from '@inertiajs/react'
import { Switch } from '@repo/ui/components/ui/switch'
import { useState } from 'react'
import { LoaderCircleIcon } from 'lucide-react'

type Props = {
  paymentMethodId: string
  isAvailable: boolean
}

export default function IsAvailableSwicthPaymentMethods({ paymentMethodId, isAvailable }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSwitchChange = (checked: boolean) => {
    router.patch(
      `/admin/payments/methods/${paymentMethodId}`,
      {
        is_available: checked,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          router.reload()
        },
        onStart: () => {
          setIsLoading(true)
        },
        onFinish: () => {
          setIsLoading(false)
        },
      }
    )
  }

  if (isLoading) {
    return <LoaderCircleIcon className="animate-spin duration-300" />
  }

  return <Switch checked={isAvailable} onCheckedChange={handleSwitchChange} />
}
