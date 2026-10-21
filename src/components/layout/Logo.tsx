import { cx } from '@/components/ui/cx';

interface LogoProps {
  readonly className?: string;
}

/** Logo em SVG (868×352). width/height reservam a proporção; a altura vem da classe. */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/brand/logo-coloridamente.svg"
      alt="Coloridamente"
      width={108}
      height={44}
      decoding="async"
      className={cx('block w-auto', className)}
    />
  );
}
