import { useEffect, useState } from 'react';
import { site, whatsappUrl } from '@/config/site';
import { Pill } from './Pill';

interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Cabeçalho claro com a logo oficial, navegação curta e o CTA de orçamento sempre à mão. */
export function SiteHeader({ nav }: { nav: readonly NavItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-header border-b bg-paper/95 text-ink backdrop-blur-sm transition-[border-color] duration-300 ${scrolled ? 'border-line' : 'border-transparent'}`}
    >
      {/* Mesma largura do banner de abertura. */}
      <div className="mx-auto flex h-full w-full max-w-[120rem] items-center justify-between gap-6 px-gutter">
        <a href={site.pages.institucional.href} className="shrink-0">
          <img
            src="/brand/logo-coloridamente.svg"
            alt="Coloridamente"
            width={868}
            height={352}
            className="h-9 w-auto lg:h-11"
          />
        </a>
        <nav aria-label="Principal" className="flex items-center gap-6 lg:gap-9">
          <ul role="list" className="hidden items-center gap-7 md:flex lg:gap-9">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[0.9375rem] font-bold tracking-[0.01em] text-soft underline-offset-[6px] transition-colors hover:text-ink hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Pill href={whatsappUrl()} whatsapp size="sm">
            <span className="sm:hidden">Orçamento</span>
            <span className="hidden sm:inline">Solicitar orçamento</span>
          </Pill>
        </nav>
      </div>
    </header>
  );
}
