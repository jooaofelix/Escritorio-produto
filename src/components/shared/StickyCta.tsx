import { useEffect, useState } from 'react';
import { whatsappUrl } from '@/config/site';
import { Pill } from './Pill';

/**
 * Barra fixa de orçamento no celular: aparece depois do primeiro bloco (ou, com `after`, quando
 * a seção indicada chega à tela) e some quando a seção de orçamento ou o rodapé, que já têm o
 * mesmo CTA, estão na tela.
 */
export function StickyCta({ after }: { after?: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [ctaInView, setCtaInView] = useState(false);

  useEffect(() => {
    const start = after ? document.getElementById(after) : null;
    const onScroll = () =>
      setPastHero(start ? start.getBoundingClientRect().top < window.innerHeight : window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const targets = [document.getElementById('orcamento'), document.querySelector('footer')].filter(Boolean) as Element[];
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
      setCtaInView(visible.size > 0);
    });
    targets.forEach((target) => observer.observe(target));
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [after]);

  const shown = pastHero && !ctaInView;
  return (
    <div
      data-sticky-cta
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm transition-transform duration-300 ease-out-soft md:hidden ${shown ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
      aria-hidden={!shown}
      inert={!shown}
    >
      <Pill href={whatsappUrl()} whatsapp size="md" arrow="upright" className="w-full">
        Solicitar orçamento pelo WhatsApp
      </Pill>
    </div>
  );
}
