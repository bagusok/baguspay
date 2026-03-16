import type { InferPageProps } from '@adonisjs/inertia/types'
import type ProductsCategoriesController from '#controllers/product_categories_controller'
import AdminLayout from '~/components/layout/admin-layout'

type Props = InferPageProps<ProductsCategoriesController, 'edit'>

export default function EditProductCategory({ title, description }: Props) {
  return (
    <AdminLayout>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </AdminLayout>
  )
}
