import { useCallback, useSyncExternalStore } from 'react';

/** Estado de uma media query, lido de forma síncrona já no primeiro render (sem flash). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/**
 * Layout empilhado (canvas no topo, texto abaixo): telas estreitas e também retratos altos
 * (ex.: tablet em pé), onde o `cover` em tela cheia mostraria só uma fatia do quadro 16:9.
 */
export const STACKED_LAYOUT_QUERY = '(max-width: 767.98px), (orientation: portrait) and (max-aspect-ratio: 4/5)';
