import type { InferPageProps } from '@adonisjs/inertia/types'
import { Link, router } from '@inertiajs/react'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui/table'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type ConfigHomesController from '#controllers/configs/config_homes_controller'
import AdminLayout from '~/components/layout/admin-layout'
import AddProductCategoryModal from './add-product-category-modal'

type Props = InferPageProps<ConfigHomesController, 'detail'>

export default function ProductSectionDetail({ productSection, productOnProductSections }: Props) {
  const connected = useMemo(() => productOnProductSections ?? [], [productOnProductSections])
  const connectedCategoryIds = useMemo(
    () => connected.map((conn: any) => conn.product_category_id),
    [connected],
  )
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const disconnect = (product_category_id: string) => {
    setDisconnecting(product_category_id)
    router.post(
      `/admin/config/home/product-sections/${productSection.id}/disconnect-product`,
      { product_category_id },
      {
        preserveScroll: true,
        onFinish: () => setDisconnecting(null),
      },
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/config/home/product-sections">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Detail Home Section</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola Product Category yang tersambung ke section ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Nama</p>
                <p className="font-medium">{productSection.name}</p>
              </div>
              {productSection.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Deskripsi</p>
                  <p className="text-sm">{productSection.description}</p>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{productSection.platform}</Badge>
                <Badge variant="outline">{productSection.type}</Badge>
                <Badge variant={productSection.is_available ? 'default' : 'destructive'}>
                  {productSection.is_available ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              {productSection.image_url && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Image</p>
                  <img
                    src={`${import.meta.env.VITE_S3_URL}${productSection.image_url}`}
                    alt={productSection.name}
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Product Category Tersambung</CardTitle>
                  <CardDescription>
                    {connected.length} kategori tersambung ke section ini
                  </CardDescription>
                </div>
                <AddProductCategoryModal
                  productSectionId={productSection.id}
                  connectedCategoryIds={connectedCategoryIds}
                  trigger={
                    <Button size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {connected.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Belum ada kategori yang tersambung.</p>
                  <p className="text-xs mt-1">Klik tombol "Tambah Kategori" untuk menambahkan.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kategori</TableHead>
                        <TableHead className="hidden md:table-cell">ID</TableHead>
                        <TableHead className="w-[100px] text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connected.map((conn: any) => (
                        <TableRow key={conn.id}>
                          <TableCell className="font-medium">{conn.productCategory.name}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                            {conn.product_category_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => disconnect(conn.product_category_id)}
                              disabled={disconnecting === conn.product_category_id}
                            >
                              {disconnecting === conn.product_category_id ? (
                                'Removing...'
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
