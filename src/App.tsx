import { useRef } from 'react';
import { CinematicSequence } from '@/components/cinematic/CinematicSequence';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SkipLink } from '@/components/layout/SkipLink';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { QuoteCta } from '@/components/sections/QuoteCta';
import { WhatWeMake } from '@/components/sections/WhatWeMake';

export default function App() {
  // Sentinela do fim do hero: o header fica transparente até ela passar sob ele.
  const heroEndRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SkipLink />
      <Header heroEndRef={heroEndRef} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <CinematicSequence />
        <div ref={heroEndRef} aria-hidden="true" />
        <WhatWeMake />
        <HowItWorks />
        <FeaturedProducts />
        <QuoteCta />
      </main>
      <Footer />
    </>
  );
}
