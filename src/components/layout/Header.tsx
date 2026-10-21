import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { site, whatsappUrl } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { cx } from '@/components/ui/cx';
import { Logo } from './Logo';
import { MOBILE_MENU_ID, MobileMenu } from './MobileMenu';

interface HeaderProps {
  /** Sentinela logo após o hero: quando passa sob o header, ele ganha fundo paper + fio. */
  readonly heroEndRef: RefObject<HTMLElement | null>;
}

const DESKTOP_QUERY = '(min-width: 64rem)';

export function Header({ heroEndRef }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sentinel = heroEndRef.current;
    const header = headerRef.current;
    if (!sentinel || !header) return;

    let observer: IntersectionObserver | undefined;
    // A borda de cima do root fica na base do header (60px; 72px no lg): recria ao trocar de breakpoint.
    const observe = () => {
      observer?.disconnect();
      const offset = header.offsetHeight;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          const edge = entry.rootBounds?.top ?? offset;
          setSolid(entry.boundingClientRect.top <= edge);
        },
        { rootMargin: `-${offset}px 0px 0px 0px` },
      );
      observer.observe(sentinel);
    };
    observe();
    const desktop = window.matchMedia(DESKTOP_QUERY);
    desktop.addEventListener('change', observe);
    return () => {
      observer?.disconnect();
      desktop.removeEventListener('change', observe);
    };
  }, [heroEndRef]);

  // flushSync: o painel fica inerte e a rolagem destravada antes de o foco voltar ao "Menu".
  const closeMenu = useCallback(() => {
    flushSync(() => setMenuOpen(false));
    menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cx(
          'fixed inset-x-0 top-0 z-50 h-header border-b transition-[background-color,border-color] duration-240 ease-out-soft',
          solid ? 'border-line bg-paper' : 'border-transparent bg-transparent',
        )}
      >
        <div className="container-page flex h-full items-center justify-between gap-8">
          <a href="#inicio" className="-my-1 shrink-0 rounded-xs py-1">
            <Logo className="h-[34px] lg:h-11" />
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            <nav aria-label="Principal">
              <ul role="list" className="flex items-center gap-8">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <TextLink href={item.href} underline="hover" className="text-[0.9375rem]">
                      {item.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </nav>
            <Button href={whatsappUrl()} whatsapp variant="secondary" size="compact">
              Solicitar orçamento
            </Button>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setMenuOpen(true)}
            className="-mr-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-3 text-[0.9375rem] font-semibold text-ink lg:hidden"
          >
            Menu
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
