import ProductsCategoriesController from '#controllers/product_categories_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import AdminLayout from '~/components/layout/admin-layout'
import SectionInputFields from './input-fields'
import SectionProductSubCategory from '../product-sub-categories'
import { useState } from 'react'
import SectionProducts from '../section-products'

type Props = InferPageProps<ProductsCategoriesController, 'detail'>

export default function ProductCategoryDetail({ productCategory }: Props) {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)

  return (
    <AdminLayout>
      <div className="h-40 overflow-hidden rounded-md">
        <img
          src={`${import.meta.env.VITE_S3_URL}${productCategory.banner_url}`}
          alt={productCategory.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col md:flex-row justify-items-center items-center md:items-start gap-4 mt-4">
        <div className="aspect-square w-28 rounded overflow-hidden flex-none h-fit">
          <img
            src={`${import.meta.env.VITE_S3_URL}${productCategory.image_url}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2 text-center md:text-start">
          <h2 className="text-lg font-semibold">{productCategory.name}</h2>
          <h2 className="text-sm italic">{productCategory.sub_name}</h2>
          <p className="text-sm text-slate-500 line-clamp-2">{productCategory.description}</p>
          <div className="flex flex-wrap gap-2">
            <p className="text-xs bg-pink-200 text-pink-500 font-medium w-fit px-2 py-0.5 rounded">
              Label: {productCategory.label}
            </p>
            <p className="text-xs bg-purple-200 text-purple-500 font-medium w-fit px-2 py-0.5 rounded">
              Featured: {productCategory.is_featured ? 'Yes' : 'No'}
            </p>
            <p className="text-xs bg-green-200 text-green-500 font-medium w-fit px-2 py-0.5 rounded">
              Available: {productCategory.is_available ? 'Yes' : 'No'}
            </p>
            <p className="text-xs bg-blue-200 text-blue-500 font-medium w-fit px-2 py-0.5 rounded">
              Delivery: {productCategory.delivery_type}
            </p>
          </div>
        </div>
      </div>
      <SectionInputFields productCategory={productCategory} />
      <SectionProductSubCategory
        productCategory={productCategory}
        selectedSubId={selectedSubId}
        setSelectedSubId={setSelectedSubId}
      />
      <SectionProducts productSubCategoryId={selectedSubId} />
    </AdminLayout>
  )
}
