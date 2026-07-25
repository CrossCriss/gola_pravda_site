import Link from "next/link";

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  image,
  imageAlt = "Розова тканина крупним планом",
}: {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-12">
          <div className="relative h-[45vh] overflow-hidden rounded-photo shadow-lg md:order-2 md:h-[520px]">
            {image ? (
              <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-500 to-brand-300" />
            )}
          </div>

          <div className="text-center md:order-1 md:text-left">
            <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl lg:text-[52px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft md:mx-0 md:text-lg">
                {subtitle}
              </p>
            )}
            <Link
              href={ctaHref}
              className="mt-8 inline-block rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white transition duration-150 ease-out hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25 md:text-base"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
