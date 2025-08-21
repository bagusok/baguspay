import ConfigHomesController from '#controllers/config_homes_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { router, useForm } from '@inertiajs/react'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '~/components/layout/admin-layout'
import { apiClient } from '~/utils/axios'

type Props = InferPageProps<ConfigHomesController, 'detail'>

export default function ProductSectionDetail({ productSection, productOnProductSections }: Props) {
  // Form to connect a product category
  const { data, setData, post, processing, errors, reset } = useForm<{
    product_category_id: string
  }>({
    product_category_id: '',
  })

  // Search with useMutation (debounced)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Array<{ id: string; name: string }>>([])

  const searchCategories = useMutation({
    mutationKey: ['searchProductCategories'],
    mutationFn: async (q: string) => {
      const res = await apiClient.get('/admin/product-categories/get-json', {
        params: { searchBy: 'name', searchQuery: q, page: 1, limit: 100 },
      })
      const payload = res.data ?? {}
      const list = Array.isArray(payload.productCategories)
        ? payload.productCategories
        : Array.isArray(payload.data)
          ? payload.data
          : []
      return list as Array<{ id: string; name: string; slug?: string }>
    },
    onSuccess: (items) => {
      setResults(items.map((x) => ({ id: x.id, name: x.name ?? x.slug ?? x.id })))
    },
  })

  useEffect(() => {
    if (!search || search.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      searchCategories.mutate(search)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const connected = useMemo(() => productOnProductSections ?? [], [productOnProductSections])

  const connect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.product_category_id) return
    post(`/admin/config/home/product-sections/${productSection.id}/connect-product`, {
      preserveScroll: true,
      onSuccess: () => {
        reset()
        setSearch('')
        setResults([])
      },
    })
  }

  const disconnect = (product_category_id: string) => {
    router.post(
      `/admin/config/home/product-sections/${productSection.id}/disconnect-product`,
      { product_category_id },
      {
        preserveScroll: true,
      }
    )
  }

  console.log(connected)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kelola Product Section</h1>

            <p className="text-sm text-muted-foreground">
              Sambungkan atau lepaskan Product Category ke Section ini.
            </p>
          </div>
          <Badge variant="secondary">{productSection.name}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connect form */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Tambah Product Category</h2>
            <form className="space-y-4" onSubmit={connect}>
              <div>
                <Label htmlFor="search">Cari kategori (min 2 huruf)</Label>
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Contoh: Pulsa, Data, Game"
                />
                {searchCategories.isPending && (
                  <p className="text-xs text-muted-foreground mt-1">Mencari…</p>
                )}
              </div>

              {results.length > 0 && (
                <div className="max-h-56 overflow-auto border rounded-md divide-y">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-muted ${
                        data.product_category_id === item.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setData('product_category_id', item.id)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.id}</div>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="product_category_id">Atau masukkan ID kategori</Label>
                <Input
                  id="product_category_id"
                  value={data.product_category_id}
                  onChange={(e) => setData('product_category_id', e.target.value)}
                  placeholder="UUID Product Category"
                />
                {errors.product_category_id && (
                  <p className="text-xs text-red-500 mt-1">{errors.product_category_id}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={processing || !data.product_category_id}>
                  {processing ? 'Menyimpan…' : 'Connect'}
                </Button>
              </div>
            </form>
          </div>

          {/* Connected list */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Product Category Tersambung</h2>
            {connected.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kategori yang tersambung.</p>
            ) : (
              <div className="space-y-2">
                {connected.map((conn: any) => (
                  <div
                    key={conn.id}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{conn.productCategory.name}</div>
                      <div className="text-xs text-muted-foreground">Mapping ID: {conn.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => disconnect(conn.product_category_id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
