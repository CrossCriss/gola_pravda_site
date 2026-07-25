import Link from "next/link";
import { ProductGrid, type GridProduct } from "@/components/catalog/ProductGrid";

export function FeaturedCategorySection({
  name,
  slug,
  products,
}: {
  name: string;
  slug: string;
  products: GridProduct[];
}) {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{name}</h2>
        <Link href={`/catalog/${slug}`} className="text-sm font-bold text-accent hover:underline">
          Всі товари →
        </Link>
      </div>
      <div className="mt-4">
        <ProductGrid products={products} emptyMessage="Товари скоро з'являться." />
      </div>
    </section>
  );
}
