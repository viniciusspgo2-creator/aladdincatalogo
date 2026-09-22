import { ProductForm } from '@/components/admin/product-form'

export const metadata = { title: 'Novo produto | Aladdin Admin', robots: { index: false } }

export default function NovoProdutoPage() {
  return (
    <div>
      <p className="kicker">Catálogo</p>
      <h1 className="mb-8 mt-1 font-display text-3xl font-bold text-white">Novo produto</h1>
      <ProductForm />
    </div>
  )
}
