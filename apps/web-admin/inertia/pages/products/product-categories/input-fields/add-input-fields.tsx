import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { apiClient } from '~/utils/axios'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'
import { router } from '@inertiajs/react'
import toast from 'react-hot-toast'

export default function AddInputFields({ productCategoryId }: { productCategoryId: string }) {
  const [open, setOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const getInputFields = useQuery({
    queryKey: ['inputFields'],
    queryFn: async () =>
      apiClient
        .get('/admin/input-fields/all')
        .then((res) => res.data)
        .catch((err) => {
          console.error('Failed to fetch input fields:', err)
          throw new Error('Failed to fetch input fields')
        }),
    enabled: false,
  })

  useEffect(() => {
    if (open) {
      getInputFields.refetch()
    }
  }, [open])

  const handleAdd = (inputId: string) => {
    router.post(
      '/admin/input-fields/connect',
      {
        input_field_id: inputId,
        product_category_id: productCategoryId,
      },
      {
        onStart: () => {
          setIsLoading(true)
        },
        onFinish: () => {
          setIsLoading(false)
        },
        onSuccess: () => {
          setOpen(false)
          getInputFields.refetch()
        },
        onError: (error) => {
          Object.keys(error).forEach((key) => {
            toast.error(error[key])
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Input</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Add Input Field</DialogTitle>
        </DialogHeader>

        {getInputFields.isLoading && <p className="text-center">Loading...</p>}
        {getInputFields.isError && (
          <p className="text-red-500 text-center">{getInputFields.error?.message}</p>
        )}
        <div className="overflow-y-auto max-h-60">
          {getInputFields.isSuccess &&
            getInputFields.data.data?.map((input: any) => (
              <div
                key={input.id}
                className="flex justify-between items-center border p-2 rounded-lg mb-1.5"
              >
                <p className="text-sm">{input.identifier}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAdd(input.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderCircleIcon className="animate-spin duration-300" />
                  ) : (
                    <PlusIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
