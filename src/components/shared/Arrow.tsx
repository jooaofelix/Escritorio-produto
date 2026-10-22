type Direction = 'right' | 'upright' | 'down';

const paths: Record<Direction, string> = {
  right: 'M3 8h10M9 4l4 4-4 4',
  upright: 'M4.5 11.5l7-7M6 4.5h5.5V10',
  down: 'M8 3v10M4 9l4 4 4-4',
};

/** Seta em traço, herda a cor do texto. */
export function Arrow({ direction = 'right', className = '' }: { direction?: Direction; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={`size-[0.85em] shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[direction]} />
    </svg>
  );
}
