import { pageGrid } from '@/components/ui/cx';

const steps = [
  {
    title: 'Sua ideia',
    text: 'Você conta pelo WhatsApp o que precisa: o tipo de produto, para quem é e como imagina o resultado.',
  },
  {
    title: 'Personalização',
    text: 'Definimos juntos como a sua marca entra no produto: capa, páginas, cores e detalhes.',
  },
  {
    title: 'Produção',
    text: 'Com tudo definido, o seu pedido segue para a produção.',
  },
  {
    title: 'Produto final',
    text: 'Os produtos ficam prontos com a sua marca, para usar no dia a dia ou presentear.',
  },
] as const;

/**
 * Etapas: a barra de cor (sequência) preenche com a rolagem — horizontal sobre as 4 colunas (lg)
 * ou vertical à esquerda (mobile). Cada etapa tem um tique ink pendurado na barra.
 */
export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="py-section">
      <div className="container-page">
        <div className={`${pageGrid} gap-y-5`}>
          <h2 id="como-funciona-titulo" className="col-span-4 text-display-lg md:col-span-6">
            A sua marca, do seu jeito
          </h2>
          <p className="measure col-span-4 text-lead text-ink-soft md:col-span-6 lg:col-span-5 lg:col-start-8 lg:self-end">
            Um caminho simples, do primeiro contato ao produto pronto com a sua marca.
          </p>
        </div>

        <div className="relative mt-12 lg:mt-16">
          <div
            aria-hidden="true"
            className="color-bar color-bar-fill absolute inset-y-0 left-0 w-1 [--bar-angle:180deg] [--bar-from:inset(0_0_100%_0)] lg:inset-x-0 lg:top-0 lg:bottom-auto lg:h-1 lg:w-auto lg:[--bar-angle:90deg] lg:[--bar-from:inset(0_100%_0_0)]"
          />
          <ol role="list" className="grid gap-y-12 pl-8 lg:grid-cols-4 lg:gap-x-8 lg:pt-10 lg:pl-0">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-3 -left-7 h-0.5 w-3 bg-ink lg:-top-9 lg:left-0 lg:h-3 lg:w-0.5"
                />
                <div className="flex items-baseline gap-3">
                  <span className="text-display-md tabular-nums">{index + 1}</span>
                  <h3 className="text-display-md">{step.title}</h3>
                </div>
                <p className="mt-2 max-w-[32ch] text-body text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
