import { UpdateProductCategoryValidator } from '#validators/product'
import { router } from '@inertiajs/react'
import { Switch } from '@repo/ui/components/ui/switch'
import { useState } from 'react'
import toast, { LoaderIcon } from 'react-hot-toast'

export default function IsAvailable({ isAvailable, id }: { isAvailable: boolean; id: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = async (v: boolean) => {
    router.patch<UpdateProductCategoryValidator>(
      `/admin/product-categories/${id}`,
      {
        is_available: v,
      },
      {
        preserveScroll: true,
        onStart: () => setIsLoading(true),
        onFinish: () => setIsLoading(false),
      }
    )
  }

  if (isLoading) {
    return <LoaderIcon className="animate-spin h-8 w-8 text-gray-500" />
  }

  return (
    <Switch
      id="is_available"
      checked={isAvailable}
      disabled={isLoading}
      onCheckedChange={(v) => handleChange(v)}
    />
  )
}
