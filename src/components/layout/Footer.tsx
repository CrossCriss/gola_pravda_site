import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Каталог",
    links: [
      { href: "/catalog/zhinocha-bilyzna", label: "Жіноча білизна" },
      { href: "/catalog/cholovicha-bilyzna", label: "Чоловіча білизна" },
      { href: "/catalog/novynky", label: "Новинки" },
      { href: "/catalog/aktsii", label: "Акції" },
    ],
  },
  {
    title: "Допомога",
    links: [
      { href: "/delivery", label: "Доставка та оплата" },
      { href: "/returns", label: "Повернення/обмін" },
    ],
  },
  {
    title: "Компанія",
    links: [
      { href: "/about", label: "Про нас" },
      { href: "/contacts", label: "Контакти" },
      { href: "/privacy", label: "Політика конфіденційності" },
      { href: "https://www.instagram.com/gola_pravda_", label: "Instagram" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-xl font-extrabold text-white">
            Gola Pravda<span className="text-accent">.</span>
          </div>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed">
            Жіноча та чоловіча білизна, яка додає впевненості щодня.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-sm font-bold text-white">{column.title}</p>
            <nav className="flex flex-col gap-2">
              {column.links.map((link) => {
                const isExternal = link.href.startsWith("http");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="text-sm transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs">
        &copy; {new Date().getFullYear()} Gola Pravda
      </div>
    </footer>
  );
}
