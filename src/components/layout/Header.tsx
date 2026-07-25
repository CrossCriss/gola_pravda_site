import Link from "next/link";
import { CartTriggerButton } from "@/components/cart/CartTriggerButton";
import { AccountNavButton } from "@/components/layout/AccountNavButton";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { SearchInput } from "@/components/layout/SearchInput";
import { prisma } from "@/lib/prisma";

const NAV_LINKS = [
  { href: "/catalog/zhinocha-bilyzna", slug: "zhinocha-bilyzna", label: "Жіноча білизна" },
  { href: "/catalog/cholovicha-bilyzna", slug: "cholovicha-bilyzna", label: "Чоловіча білизна" },
  { href: "/catalog/novynky", slug: "novynky", label: "Новинки" },
  { href: "/catalog/aktsii", slug: "aktsii", label: "Акції" },
];

async function getSubcategoriesBySlug() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, isVisible: true },
    include: { children: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return new Map(
    categories.map((category) => [
      category.slug,
      category.children.map((child) => ({ slug: child.slug, name: child.name })),
    ])
  );
}

export async function Header() {
  const subcategoriesBySlug = await getSubcategoriesBySlug();
  const navLinks = NAV_LINKS.map((link) => ({
    ...link,
    subcategories: subcategoriesBySlug.get(link.slug) ?? [],
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="bg-ink py-2 text-center text-xs font-semibold tracking-wide text-white">
        Безкоштовна доставка Новою Поштою від 1500 ₴
      </div>
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MobileNav links={navLinks} />
          <Link
            href="/"
            className="whitespace-nowrap font-display text-xl font-extrabold tracking-tight text-ink"
          >
            Gola Pravda<span className="text-accent">.</span>
          </Link>
        </div>

        <nav className="hidden gap-7 text-sm font-semibold md:flex">
          {navLinks.map((link) => (
            <NavDropdown
              key={link.href}
              href={link.href}
              label={link.label}
              subcategories={link.subcategories}
            />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SearchInput />
          <AccountNavButton />
          <CartTriggerButton />
        </div>
      </div>
    </header>
  );
}
