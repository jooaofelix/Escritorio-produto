import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { OpensWhatsApp, whatsappLinkProps } from './whatsapp';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'default' | 'compact';

interface ButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  /** Só o secundário tem versão compacta (header). */
  readonly size?: ButtonSize;
  /** Seta "→": reservada aos dois CTAs do briefing. */
  readonly arrow?: boolean;
  /** Link para o WhatsApp: nova aba + aviso para leitores de tela. */
  readonly whatsapp?: boolean;
}

const base =
  'group/button inline-flex items-center justify-center gap-2.5 rounded-sm text-center font-sans font-semibold ' +
  'transition-[background-color,color,translate] duration-160 ease-out-soft active:duration-80 motion-safe:active:translate-y-px';

const variants: Record<ButtonVariant, string> = {
  primary: 'min-h-12 bg-sun px-6 text-base text-ink hover:bg-sun-deep active:bg-sun-deep',
  secondary: 'border-[1.5px] border-ink px-4 text-[0.9375rem] leading-none text-ink hover:bg-ink hover:text-paper',
};

const secondarySizes: Record<ButtonSize, string> = {
  default: 'h-12',
  compact: 'h-10',
};

export function Button({
  href,
  children,
  variant = 'primary',
  size = 'default',
  arrow = false,
  whatsapp = false,
  className,
  ...rest
}: ButtonProps) {
  return (
    <a
      href={href}
      {...(whatsapp ? whatsappLinkProps : {})}
      {...rest}
      className={cx(base, variants[variant], variant === 'secondary' && secondarySizes[size], className)}
    >
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="transition-transform duration-240 ease-out-soft motion-safe:group-hover/button:translate-x-1"
        >
          →
        </span>
      )}
      {whatsapp && <OpensWhatsApp />}
    </a>
  );
}
