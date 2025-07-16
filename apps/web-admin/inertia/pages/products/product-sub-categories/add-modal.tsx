import { CreateProductSubCategoryValidator } from '#validators/product'
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
import { useState } from 'react'
import FileManager from '~/components/file-manager'

type Props = {
  productCategoryId: string
}

export default function AddProductSubCategoryModal({ productCategoryId }: Props) {
  const [open, setOpen] = useState(false)

  const { data, setData, errors, processing, post, reset } =
    useForm<CreateProductSubCategoryValidator>({
      product_category_id: productCategoryId,
      image_id: '',
      name: '',
      sub_name: '',
      description: '',
      is_available: true,
      is_featured: false,
      label: '',
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/product-sub-categories', {
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
        <Button size="sm">Add Sub Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Add Sub Category</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div className="max-h-32">
            <Label className="mb-2" htmlFor="name">
              Image <span className="text-red-500">*</span>
            </Label>
            <FileManager onFilesSelected={(f) => setData('image_id', f.id)} />
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
            <Input value={data.sub_name} onChange={(e) => setData('sub_name', e.target.value)} />
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
              {errors.is_available && <p className="text-red-500 text-sm">{errors.is_available}</p>}
            </div>
            <div className="w-full">
              <Label className="mb-2" htmlFor="name">
                Featured
              </Label>
              <Switch
                checked={data.is_featured}
                onCheckedChange={(checked) => setData('is_featured', checked)}
              />
              {errors.is_featured && <p className="text-red-500 text-sm">{errors.is_featured}</p>}
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
      </DialogContent>
    </Dialog>
  )
}
