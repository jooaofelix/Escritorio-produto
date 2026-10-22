import type { ReactNode } from 'react';
import { Arrow } from './Arrow';
import { OpensWhatsApp, whatsappLinkProps } from './whatsapp';

type Tone = 'coral' | 'ink' | 'outline' | 'outline-dark';
type Size = 'sm' | 'md' | 'lg';

const tones: Record<Tone, string> = {
  coral: 'bg-coral text-ink hover:bg-coral-deep',
  ink: 'bg-ink text-paper hover:bg-graphite',
  outline: 'text-ink ring-[1.5px] ring-ink/25 ring-inset hover:ring-ink',
  'outline-dark': 'text-paper ring-[1.5px] ring-paper/30 ring-inset hover:ring-paper',
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
  readonly arrow?: 'right' | 'upright' | 'down';
  /** Link de WhatsApp: abre em nova aba e anuncia isso a leitores de tela. */
  readonly whatsapp?: boolean;
  readonly className?: string;
}

/** Botão em pílula das propostas (link). */
export function Pill({ href, children, tone = 'coral', size = 'md', arrow, whatsapp, className = '' }: PillProps) {
  const hover =
    arrow === 'upright'
      ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
      : arrow === 'down'
        ? 'group-hover:translate-y-0.5'
        : 'group-hover:translate-x-1';
  return (
    <a
      href={href}
      {...(whatsapp ? whatsappLinkProps : {})}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full font-bold tracking-[0.01em] transition-[background-color,box-shadow,transform] duration-200 ease-out-soft active:scale-[0.98] ${tones[tone]} ${sizes[size]} ${className}`}
    >
      <span>{children}</span>
      {arrow && <Arrow direction={arrow} className={`transition-transform duration-200 ease-out-soft ${hover}`} />}
      {whatsapp && <OpensWhatsApp />}
    </a>
  );
}
