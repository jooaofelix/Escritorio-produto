import React from 'react';
import {Composition, Still} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {Showcase} from './Showcase';
import {FontGate} from './components/Text';
import {Fidelidade} from './Fidelidade';

const Video: React.FC = () => (
  <FontGate>
    <Showcase />
  </FontGate>
);
const Check: React.FC<{i: number}> = ({i}) => (
  <FontGate>
    <Fidelidade i={i} />
  </FontGate>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showcase" component={Video} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    {/* conferência de fidelidade: cada proposta na escala da página do PDF (1600×900) */}
    {[0, 1, 2, 3, 4].map((i) => (
      <Still key={i} id={`Fidelidade${i + 1}`} component={Check} defaultProps={{i}} width={1600} height={900} />
    ))}
  </>
);
