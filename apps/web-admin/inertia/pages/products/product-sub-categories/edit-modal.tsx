import { UpdateProductSubCategoryValidator } from '#validators/product'
import { useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Switch } from '@repo/ui/components/ui/switch'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { useEffect, useState } from 'react'
import FileManager from '~/components/file-manager'
import { EditIcon } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '~/utils/axios'

type Props = {
  productSubCategoryId: string
}

export default function EditProductSubCategoryModal({ productSubCategoryId }: Props) {
  const [open, setOpen] = useState(false)

  const { data, setData, errors, processing, patch, reset } =
    useForm<UpdateProductSubCategoryValidator>({
      product_category_id: productSubCategoryId,
      image_id: '',
      name: '',
      sub_name: '',
      description: '',
      is_available: true,
      is_featured: false,
      label: '',
    })

  const productSubCategory = useMutation({
    mutationKey: ['productSubCategory', productSubCategoryId],
    mutationFn: () =>
      apiClient
        .get(`/admin/product-sub-categories/${productSubCategoryId}`)
        .then((res) => {
          const subCategory = res.data.data
          setData({
            ...data,
            image_id: subCategory.image_id || '',
            name: subCategory.name,
            sub_name: subCategory.sub_name || '',
            description: subCategory.description || '',
            is_available: subCategory.is_available,
            is_featured: subCategory.is_featured,
            label: subCategory.label || '',
          })
          return subCategory.data
        })
        .catch((err) => {
          throw new Error(err.response?.data?.message || 'Failed to fetch product sub-category')
        }),
  })

  useEffect(() => {
    if (open) {
      productSubCategory.mutate()
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(`/admin/product-sub-categories/${productSubCategoryId}`, {
      onSuccess: () => {
        reset()
        setOpen(false)
      },
      onError: (error) => {
        console.error('Error creating sub-category:', error)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <EditIcon className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Add Sub Category</DialogTitle>
        </DialogHeader>

        {productSubCategory.isPending && <p>Loading...</p>}
        {productSubCategory.isError && (
          <p className="text-red-500">Error: {productSubCategory.error.message}</p>
        )}
        {productSubCategory.isSuccess && (
          <>
            <form className="space-y-4">
              <div className="max-h-32">
                <Label className="mb-2" htmlFor="name">
                  Image <span className="text-red-500">*</span>
                </Label>
                <FileManager
                  onFilesSelected={(f) => setData('image_id', f.id)}
                  defaultFileId={data.image_id}
                />
                {errors.image_id && <p className="text-red-500 text-sm">{errors.image_id}</p>}
              </div>
              <div>
                <Label className="mb-2" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div>
                <Label className="mb-2" htmlFor="name">
                  Sub Name
                </Label>
                <Input
                  value={data.sub_name}
                  onChange={(e) => setData('sub_name', e.target.value)}
                />
                {errors.sub_name && <p className="text-red-500 text-sm">{errors.sub_name}</p>}
              </div>
              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="name">
                    Available
                  </Label>
                  <Switch
                    checked={data.is_available}
                    onCheckedChange={(checked) => setData('is_available', checked)}
                  />
                  {errors.is_available && (
                    <p className="text-red-500 text-sm">{errors.is_available}</p>
                  )}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="name">
                    Featured
                  </Label>
                  <Switch
                    checked={data.is_featured}
                    onCheckedChange={(checked) => setData('is_featured', checked)}
                  />
                  {errors.is_featured && (
                    <p className="text-red-500 text-sm">{errors.is_featured}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="mb-2" htmlFor="name">
                  Label
                </Label>
                <Input value={data.label} onChange={(e) => setData('label', e.target.value)} />
                {errors.label && <p className="text-red-500 text-sm">{errors.label}</p>}
              </div>
              <div>
                <Label className="mb-2" htmlFor="name">
                  Description
                </Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
            </form>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" onClick={() => reset()}>
                  Cancel
                </Button>
              </DialogClose>

              <Button onClick={handleSubmit} disabled={processing} className="ml-2">
                {processing ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
