import { router } from '@inertiajs/react'
import { Switch } from '@repo/ui/components/ui/switch'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LoaderCircleIcon } from 'lucide-react'

type Props = {
  isAvailable: boolean
  productId: string
}

export default function IsAvailableSwitchProduct({ isAvailable, productId }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleSwitchChange = async (checked: boolean) => {
    router.patch(
      `/admin/products/${productId}/update-is-available`,
      {
        is_available: checked,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['products'],
            exact: false,
          })
        },
        preserveScroll: true,
        onStart: () => setIsLoading(true),
        onFinish: () => setIsLoading(false),
      }
    )
  }

  if (isLoading) {
    return <LoaderCircleIcon className="animate-spin" />
  }

  return <Switch checked={isAvailable} onCheckedChange={handleSwitchChange} />
}
