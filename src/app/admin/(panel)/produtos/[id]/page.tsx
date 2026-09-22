import { ProductForm } from '@/components/admin/product-form'

export const metadata = { title: 'Editar produto | Aladdin Admin', robots: { index: false } }

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <p className="kicker">Catálogo</p>
      <h1 className="mb-8 mt-1 font-display text-3xl font-bold text-white">Editar produto</h1>
      <ProductForm productId={id} />
    </div>
  )
}
