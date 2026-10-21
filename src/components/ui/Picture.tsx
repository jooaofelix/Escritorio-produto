interface PictureProps {
  /** Caminho sem o sufixo: os arquivos são `{base}-{largura}.{avif|webp}`. */
  readonly base: string;
  readonly widths: readonly number[];
  readonly sizes: string;
  readonly alt: string;
  /** Dimensões intrínsecas (reservam a proporção: zero CLS). */
  readonly width: number;
  readonly height: number;
  readonly className?: string;
  readonly imgClassName?: string;
  readonly loading?: 'lazy' | 'eager';
}

function srcSet(base: string, widths: readonly number[], ext: 'avif' | 'webp') {
  return widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
}

/** `<picture>` AVIF + WebP com srcset/sizes. */
export function Picture({
  base,
  widths,
  sizes,
  alt,
  width,
  height,
  className,
  imgClassName,
  loading = 'lazy',
}: PictureProps) {
  const fallback = widths[widths.length - 1];
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(base, widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(base, widths, 'webp')} sizes={sizes} />
      <img
        src={`${base}-${fallback}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={imgClassName}
      />
    </picture>
  );
}
