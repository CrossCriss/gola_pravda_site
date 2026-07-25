"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function CatalogFilters({
  sizes,
  prints,
}: {
  sizes: string[];
  prints: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);

  const selectedSizes = new Set((searchParams.get("size") ?? "").split(",").filter(Boolean));
  const selectedPrints = new Set((searchParams.get("print") ?? "").split(",").filter(Boolean));
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const hasActiveFilters =
    selectedSizes.size > 0 || selectedPrints.size > 0 || minPrice || maxPrice;
  const activeCount =
    selectedSizes.size + selectedPrints.size + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  function pushParams(params: URLSearchParams) {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleValue(key: "size" | "print", value: string, current: Set<string>) {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);

    const params = new URLSearchParams(searchParams.toString());
    if (next.size) params.set(key, Array.from(next).join(","));
    else params.delete(key);
    params.delete("page");
    pushParams(params);
  }

  function handlePriceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const min = (formData.get("minPrice") as string)?.trim();
    const max = (formData.get("maxPrice") as string)?.trim();

    const params = new URLSearchParams(searchParams.toString());
    min ? params.set("minPrice", min) : params.delete("minPrice");
    max ? params.set("maxPrice", max) : params.delete("maxPrice");
    params.delete("page");
    pushParams(params);
  }

  function resetFilters() {
    router.push(pathname);
  }

  return (
    <aside className="w-full shrink-0 md:w-56">
      <button
        type="button"
        onClick={() => setIsOpenOnMobile((prev) => !prev)}
        className="mb-4 flex w-full items-center justify-between rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium md:hidden"
      >
        <span>Фільтри{activeCount > 0 ? ` (${activeCount})` : ""}</span>
        <span aria-hidden>{isOpenOnMobile ? "▲" : "▼"}</span>
      </button>

      <div className={cn(isOpenOnMobile ? "block" : "hidden", "md:block")}>
        {sizes.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium">Розмір</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleValue("size", size, selectedSizes)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition duration-150 ease-out",
                    selectedSizes.has(size)
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-brand-300"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {prints.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium">Принт/Малюнок</p>
            <div className="flex flex-wrap gap-2">
              {prints.map((print) => (
                <button
                  key={print}
                  type="button"
                  onClick={() => toggleValue("print", print, selectedPrints)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition duration-150 ease-out",
                    selectedPrints.has(print)
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-brand-300"
                  )}
                >
                  {print}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Ціна, грн</p>
          <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
            <input
              name="minPrice"
              defaultValue={minPrice}
              placeholder="від"
              inputMode="numeric"
              className="w-20 rounded border border-neutral-200 px-2 py-1 text-sm transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none"
            />
            <input
              name="maxPrice"
              defaultValue={maxPrice}
              placeholder="до"
              inputMode="numeric"
              className="w-20 rounded border border-neutral-200 px-2 py-1 text-sm transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-neutral-900 px-3 py-1 text-sm text-white transition duration-150 ease-out hover:bg-neutral-700"
            >
              OK
            </button>
          </form>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-neutral-500 underline transition-colors duration-150 ease-out hover:text-neutral-800"
          >
            Скинути фільтри
          </button>
        )}
      </div>
    </aside>
  );
}
