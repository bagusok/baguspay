import ProductsCategoriesController from '#controllers/product_categories_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Button } from '@repo/ui/components/ui/button'
import { Trash2 } from 'lucide-react'
import AddProductSubCategoryModal from './add-modal'
import { router } from '@inertiajs/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import EditProductSubCategoryModal from './edit-modal'
import { cn } from '@repo/ui/lib/utils'

type Props = {
  productCategory: InferPageProps<ProductsCategoriesController, 'detail'>['productCategory']
  selectedSubId: string | null
  setSelectedSubId: (id: string | null) => void
}

export default function SectionProductSubCategory({
  productCategory,
  selectedSubId,
  setSelectedSubId,
}: Props) {
  const handleDelete = (id: string) => {
    router.delete(`/admin/product-sub-categories/${id}`, {})
  }

  return (
    <section className="mt-6">
      <div className="flex justify-between items-end">
        <h2 className="text-lg font-semibold">Sub Categories</h2>
        <AddProductSubCategoryModal productCategoryId={productCategory.id} />
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {productCategory.product_sub_categories?.length < 1 && (
          <p className="text-sm text-muted-foreground">No sub-categories found.</p>
        )}
        {productCategory.product_sub_categories?.map((sub) => (
          <div
            key={sub.id}
            className={cn(
              'group relative bg-card border rounded-lg p-2 cursor-pointer transition-all duration-300 hover:shadow-soft',
              {
                'border-primary shadow-soft': sub.id === selectedSubId,
              }
            )}
            onClick={() => setSelectedSubId(sub.id)}
          >
            <div className="flex items-start justify-between gap-3 min-w-[200px]">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  {sub.image_url && (
                    <img
                      src={`${import.meta.env.VITE_S3_URL}${sub.image_url}`}
                      alt={sub.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <h3 className="font-medium text-foreground">{sub.name}</h3>
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <EditProductSubCategoryModal productSubCategoryId={sub.id} />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="destructive" onClick={() => handleDelete(sub.id)}>
                        Yes
                      </Button>
                      <Button variant="outline">Cancel</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
