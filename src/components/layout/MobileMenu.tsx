import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { site, whatsappUrl } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { cx } from '@/components/ui/cx';
import { Logo } from './Logo';

export const MOBILE_MENU_ID = 'menu-mobile';
const DESKTOP_QUERY = '(min-width: 64rem)';
const FOCUSABLE = 'a[href], button:not([disabled])';

interface MobileMenuProps {
  readonly open: boolean;
  /** Fecha o menu e devolve o foco ao botão "Menu". */
  readonly onClose: () => void;
}

/**
 * Painel de tela cheia (< lg). Fica montado para a transição de saída: fechado, é `invisible` + `inert`.
 * Abrir: fade + translate-y −8px→0 (240ms). Fechar: só fade (160ms).
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Trava a rolagem do documento enquanto aberto (layout effect: libera antes de qualquer navegação).
  useLayoutEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Foco inicial no 1º link, Esc fecha, Tab circula dentro do painel; fecha ao chegar no layout desktop.
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      const outside = !panelRef.current.contains(active);
      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [open, onClose]);

  // Fecha (liberando a rolagem) e só então rola até a seção, respeitando o scroll-padding do header.
  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    onClose();
    target.scrollIntoView({ block: 'start' });
    window.history.pushState(null, '', href);
  };

  return (
    <div
      ref={panelRef}
      id={MOBILE_MENU_ID}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={cx(
        'fixed inset-0 z-60 flex flex-col overflow-y-auto overscroll-contain bg-paper lg:hidden',
        open
          ? 'visible translate-y-0 opacity-100 [transition:opacity_240ms_var(--ease-out-soft),translate_240ms_var(--ease-out-soft),visibility_0s]'
          : 'invisible -translate-y-2 opacity-0 [transition:opacity_160ms_var(--ease-in-out-soft),translate_0s_160ms,visibility_0s_160ms]',
      )}
    >
      <div className="container-page flex h-header shrink-0 items-center justify-between">
        <Logo className="h-[34px]" />
        <button
          type="button"
          onClick={onClose}
          className="-mr-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-3 text-[0.9375rem] font-semibold text-ink"
        >
          Fechar
        </button>
      </div>

      <nav aria-label="Principal" className="container-page mt-4 flex-1">
        <ul role="list" className="border-t border-line">
          {site.nav.map((item, index) => (
            <li key={item.href} className="border-b border-line">
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={(event) => handleNavigate(event, item.href)}
                className="flex min-h-14 items-center text-display-md text-ink underline decoration-transparent decoration-2 underline-offset-6 transition-[text-decoration-color] duration-160 ease-out-soft hover:decoration-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page shrink-0 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button href={whatsappUrl()} whatsapp className="w-full">
          Solicitar orçamento
        </Button>
      </div>
    </div>
  );
}
