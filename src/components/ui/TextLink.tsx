import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { OpensWhatsApp, whatsappLinkProps } from './whatsapp';

interface TextLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  readonly href: string;
  readonly children: ReactNode;
  /** `hover`: sem sublinhado em repouso (nav do header, rodapé e menu). */
  readonly underline?: 'always' | 'hover';
  readonly whatsapp?: boolean;
}

const underlines = {
  always: 'decoration-ink/40',
  hover: 'decoration-transparent',
} as const;

export function TextLink({
  href,
  children,
  underline = 'always',
  whatsapp = false,
  className,
  ...rest
}: TextLinkProps) {
  return (
    <a
      href={href}
      {...(whatsapp ? whatsappLinkProps : {})}
      {...rest}
      className={cx(
        'font-medium text-ink underline decoration-1 underline-offset-4',
        'transition-[text-decoration-color,text-decoration-thickness] duration-160 ease-out-soft',
        'hover:decoration-ink hover:decoration-2',
        underlines[underline],
        className,
      )}
    >
      {children}
      {whatsapp && <OpensWhatsApp />}
    </a>
  );
}
