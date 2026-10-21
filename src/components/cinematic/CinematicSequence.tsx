import { useCallback, useState } from 'react';
import { MotionSequence } from './MotionSequence';
import { StaticSequence } from './StaticSequence';
import { REDUCED_MOTION_QUERY, useMediaQuery } from './useMediaQuery';

/**
 * Hero da landing: sequência cinematográfica controlada pela rolagem.
 * Com prefers-reduced-motion (ou se o primeiro frame não carregar) cai para os 4 capítulos
 * estáticos com stills. O título do capítulo 1 é o único `<h1>` da página.
 */
export function CinematicSequence() {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [failed, setFailed] = useState(false);
  const handleFail = useCallback(() => setFailed(true), []);
  const motion = !reducedMotion && !failed;

  return (
    <section id="inicio" aria-label="Apresentação" className="relative bg-studio">
      {motion ? <MotionSequence onFail={handleFail} /> : <StaticSequence />}
    </section>
  );
}
