import type { ReactNode } from 'react';
import { Arrow } from './Arrow';
import { OpensWhatsApp, whatsappLinkProps } from './whatsapp';

type Tone = 'sun' | 'coral' | 'ink';
type Size = 'sm' | 'md' | 'lg';

const tones: Record<Tone, string> = {
  sun: 'bg-sun-soft text-ink hover:bg-sun',
  coral: 'bg-coral-btn text-ink hover:bg-coral',
  ink: 'bg-ink text-paper hover:bg-forest',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-10 px-4 text-[0.875rem]',
  md: 'min-h-12 px-6 text-[0.9375rem]',
  lg: 'min-h-14 px-7 text-base',
};

interface PillProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly tone?: Tone;
  readonly size?: Size;
  readonly arrow?: 'right' | 'upright';
  /** Link de WhatsApp: abre em nova aba e anuncia isso a leitores de tela. */
  readonly whatsapp?: boolean;
  readonly className?: string;
}

/** Botão em pílula das propostas (link). */
export function Pill({ href, children, tone = 'sun', size = 'md', arrow, whatsapp, className = '' }: PillProps) {
  return (
    <a
      href={href}
      {...(whatsapp ? whatsappLinkProps : {})}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full font-bold tracking-[0.01em] transition-[background-color,transform] duration-200 ease-out-soft active:scale-[0.98] ${tones[tone]} ${sizes[size]} ${className}`}
    >
      <span>{children}</span>
      {arrow && (
        <Arrow
          direction={arrow}
          className={`transition-transform duration-200 ease-out-soft ${arrow === 'upright' ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : 'group-hover:translate-x-1'}`}
        />
      )}
      {whatsapp && <OpensWhatsApp />}
    </a>
  );
}
