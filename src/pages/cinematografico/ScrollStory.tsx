import { useLayoutEffect, useRef, useState } from 'react';
import { products } from '@/data/products';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { whatsappUrl } from '@/config/site';
import { Arrow } from '@/components/shared/Arrow';
import { Pill } from '@/components/shared/Pill';
import { ProductPicture, productById } from '@/components/shared/ProductPicture';

/** As 4 etapas da rolagem: a cada uma o contador avança, a foto troca e uma camada de texto entra. */
const PHOTOS = ['caderno-espiral-capa', 'caderno-aberto-pautado', 'agenda-2027', 'kit-acessorios-escritorio'];
const TITLE = ['Quando a sua', 'marca ganha', 'forma.'];
const STEPS = PHOTOS.length;

function useReducedMotion() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduced;
}

/** Hero da proposta 05 — sequência fixada na tela e controlada pela rolagem (fotos, máscaras e paralaxe). */
export function ScrollStory() {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const photos = PHOTOS.map((id) => productById(products, id));

  useLayoutEffect(() => {
    if (reduced || !stage.current) return;
    const root = stage.current;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      // Profundidade: camadas andam em velocidades diferentes durante toda a sequência.
      tl.to(q('[data-layer="card"]'), { yPercent: -6, duration: STEPS }, 0)
        .to(q('[data-layer="box"]'), { yPercent: -10, duration: STEPS }, 0)
        .to(q('[data-layer="counter"]'), { y: -18, duration: STEPS }, 0)
        .to(q('[data-hint]'), { autoAlpha: 0, duration: 0.3 }, 0.05);

      for (let i = 1; i < STEPS; i++) {
        const at = i - 0.55;
        tl.fromTo(
          q(`[data-photo="${i}"]`),
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.inOut' },
          at,
        )
          .fromTo(q(`[data-photo="${i}"] img`), { scale: 1.22 }, { scale: 1, duration: 0.9, ease: 'power2.out' }, at)
          .to(q(`[data-count="${i - 1}"]`), { yPercent: -100, autoAlpha: 0, duration: 0.3, ease: 'power2.out' }, at)
          .fromTo(
            q(`[data-count="${i}"]`),
            { yPercent: 100, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
            at,
          )
          .fromTo(q(`[data-dash="${i}"]`), { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, at);
        // Linhas 2 e 3 do título; na etapa 4 entra o texto de apoio.
        if (i < TITLE.length) {
          tl.fromTo(q(`[data-line="${i}"]`), { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' }, at);
        } else {
          tl.fromTo(q('[data-support]'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at);
        }
      }
      tl.to({}, { duration: 0.4 }); // respiro final antes de soltar o pin

      ScrollTrigger.create({
        trigger: root,
        pin: true,
        start: () => `top top+=${document.querySelector('header')?.offsetHeight ?? 0}`,
        end: () => `+=${Math.round(window.innerHeight * 3)}`,
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="inicio" aria-labelledby="historia-titulo" className="on-dark bg-night text-paper">
      <div
        ref={stage}
        data-stage
        className={`relative ${reduced ? '' : 'h-[calc(100svh-var(--spacing-header))] min-h-[34rem] overflow-hidden'}`}
      >
        <div className="container-page flex h-full flex-col justify-center gap-8 py-10 lg:py-12">
          <div className="relative">
            {/* Contador 01 / 04 */}
            <div data-layer="counter" aria-hidden="true" className="relative lg:absolute lg:top-[2%] lg:left-[0.5%]">
              <div className="enter-fade relative h-5 w-24 overflow-hidden text-label text-mint-ink" style={{ animationDelay: '0.2s' }}>
              {photos.map((_, i) => (
                <span
                  key={i}
                  data-count={i}
                  className="absolute inset-0"
                  style={reduced ? undefined : { visibility: i === 0 ? 'visible' : 'hidden' }}
                >
                  {`0${i + 1} / 0${STEPS}`}
                </span>
              ))}
              </div>
            </div>

            {/* Cartão das fotos */}
            <div data-layer="card" className="mt-5 lg:mt-0 lg:ml-[34%] lg:w-[58%]">
              <div className="enter-settle rounded-md bg-card p-[2.6%]" style={{ animationDelay: '0.25s' }}>
              <div className={`relative overflow-hidden rounded-xs bg-white ${reduced ? '' : 'aspect-[354/252]'}`}>
                {reduced ? (
                  <ul role="list" className="grid grid-cols-2 gap-1 bg-card">
                    {photos.map((product) => (
                      <li key={product.id} className="bg-white">
                        <ProductPicture
                          product={product}
                          sizes="(min-width: 1024px) 28vw, 50vw"
                          imgClassName="aspect-[354/252] h-auto w-full object-contain"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  photos.map((product, i) => (
                    <div
                      key={product.id}
                      data-photo={i}
                      className="absolute inset-0 bg-white"
                      style={i === 0 ? undefined : { clipPath: 'inset(100% 0% 0% 0%)' }}
                    >
                      <ProductPicture
                        product={product}
                        sizes="(min-width: 1024px) 56vw, 100vw"
                        loading="eager"
                        className="block h-full"
                        imgClassName="h-full w-full object-contain"
                      />
                    </div>
                  ))
                )}
              </div>
              </div>
            </div>

            {/* Caixa de texto sobreposta, em outra profundidade */}
            <div
              data-layer="box"
              className="relative z-10 -mt-12 mr-6 sm:mr-[30%] lg:absolute lg:top-[21%] lg:left-0 lg:m-0 lg:w-[44%]"
            >
              <div
                className="enter-fade bg-night-box px-5 pt-6 pb-7 lg:px-0 lg:pt-7 lg:pr-8 lg:pb-9"
                style={{ animationDelay: '0.45s' }}
              >
              <p className="mb-4 text-label text-coral">Linha Office</p>
              <h1 id="historia-titulo" className="text-display-1">
                {TITLE.map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.08em]">
                    <span data-line={i} className="block">
                      {line}
                    </span>
                    {i < TITLE.length - 1 && ' '}
                  </span>
                ))}
              </h1>
              <div data-support className="mt-5" style={reduced ? undefined : { opacity: 0, visibility: 'hidden' }}>
                <p className="max-w-[38ch] text-body text-on-dark">
                  Uma experiência para descobrir cada detalhe enquanto você navega.
                </p>
                <Pill href={whatsappUrl()} whatsapp arrow="upright" className="mt-6">
                  Solicitar orçamento
                </Pill>
              </div>
              </div>
            </div>
          </div>

          {/* Rodapé do palco: dica de rolagem + progresso */}
          <div className="flex items-center justify-between gap-6">
            <p data-hint className="inline-flex items-center gap-2 text-label" aria-hidden={reduced ? undefined : 'true'}>
              {reduced ? 'Conheça os produtos' : 'Role para explorar'}
              <Arrow direction="down" className="motion-safe:animate-bounce" />
            </p>
            <div className="flex gap-2" aria-hidden="true">
              {photos.map((_, i) => (
                <span key={i} className="h-[3px] w-8 overflow-hidden rounded-full bg-[#5E625D] lg:w-10">
                  <span
                    data-dash={i}
                    className="block h-full origin-left bg-coral"
                    style={reduced || i === 0 ? undefined : { transform: 'scaleX(0)' }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
