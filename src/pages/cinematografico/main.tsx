import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Faq } from '@/components/shared/Faq';
import { ProcessSteps } from '@/components/shared/ProcessSteps';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { SkipLink } from '@/components/shared/SkipLink';
import { StickyCta } from '@/components/shared/StickyCta';
import { ProductReel } from './ProductReel';
import { Quote } from './Quote';
import { ScrollStory } from './ScrollStory';
import '@/styles/index.css';

const NAV = [
  { label: 'Produtos', href: '#produtos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Dúvidas', href: '#duvidas' },
];
const FOOTER_NAV = [...NAV, { label: 'Orçamento', href: '#orcamento' }];

/** Proposta 05 — Scroll cinematográfico, organizada como funil de vendas. */
function Page() {
  return (
    <>
      <SkipLink />
      <SiteHeader nav={NAV} />
      <main id="conteudo" tabIndex={-1} className="bg-night outline-none">
        <ScrollStory />
        <ProductReel />
        <ProcessSteps tone="night" />
        <Faq tone="dark" />
        <Quote />
      </main>
      <SiteFooter nav={FOOTER_NAV} current="cinematografico" />
      {/* A história já termina com o CTA; a barra entra a partir dos produtos. */}
      <StickyCta after="produtos" />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
