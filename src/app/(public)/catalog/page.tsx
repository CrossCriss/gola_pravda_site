import { CategoryGrid } from "@/components/catalog/CategoryGrid";

export const dynamic = "force-dynamic";

// Каталог: список категорій верхнього рівня.
export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Каталог</h1>
      <div className="mt-6">
        <CategoryGrid />
      </div>
    </div>
  );
}
