import { useEffect, useState } from 'react';
import { site, whatsappUrl } from '@/config/site';
import { Pill } from './Pill';

type Tone = 'forest' | 'night';

interface NavItem {
  readonly label: string;
  readonly href: string;
}

const backgrounds: Record<Tone, string> = { forest: 'bg-forest', night: 'bg-night' };

/** Cabeçalho das propostas: "coloridamente." + Produtos / Sobre + pílula "Orçamento". */
export function SiteHeader({ tone, nav, divider = true }: { tone: Tone; nav: readonly NavItem[]; divider?: boolean }) {
  // Fio inferior aparece só depois que a página rola (no topo o cabeçalho se funde ao hero).
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 h-header text-paper ${backgrounds[tone]}`}>
      <div className="container-page flex h-full items-center justify-between gap-6">
        <a href={site.pages.institucional.href} className="text-[1.375rem] font-black tracking-[0.005em] lg:text-[1.5rem]">
          coloridamente.
        </a>
        <nav aria-label="Principal" className="flex items-center gap-6 lg:gap-9">
          <ul role="list" className="hidden items-center gap-6 sm:flex lg:gap-9">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[0.9375rem] tracking-[0.02em] text-paper/85 underline-offset-[6px] transition-colors hover:text-paper hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Pill href={whatsappUrl()} whatsapp tone="coral" size="sm">
            Orçamento
          </Pill>
        </nav>
      </div>
      {divider && (
        <div className="container-page pointer-events-none absolute inset-x-0 bottom-0">
          <div className={`h-px bg-paper/14 transition-opacity duration-300 ${scrolled ? 'opacity-0' : 'opacity-100'}`} />
        </div>
      )}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-px bg-paper/10 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      />
    </header>
  );
}
