import ProductsCategoriesController from '#controllers/product_categories_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import AddInputFields from './add-input-fields'
import { Button } from '@repo/ui/components/ui/button'
import { LoaderCircle, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { router } from '@inertiajs/react'

type Props = {
  productCategory: InferPageProps<ProductsCategoriesController, 'detail'>['productCategory']
}

export default function SectionInputFields({ productCategory }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteInput = (inputId: string) => {
    router.delete(`/admin/input-fields/disconnect/${inputId}`, {
      onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false),
    })
  }

  return (
    <section className="mt-6">
      <div className="flex justify-between items-end">
        <h3 className="font-semibold text-lg">Input Fields</h3>
        <AddInputFields productCategoryId={productCategory.id} />
      </div>
      <div className="mt-2">
        {productCategory.input_on_product_category.length < 1 && (
          <p className="text-sm text-center">No input found</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productCategory.input_on_product_category.map((input) => (
            <div key={input.id} className="border p-2 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-sm">{input.input_field.identifier}</h4>
                <p className="text-sm text-gray-500">{input.input_field.type}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading}
                onClick={() => handleDeleteInput(input.id)}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin duration-300" />
                ) : (
                  <Trash2Icon />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
