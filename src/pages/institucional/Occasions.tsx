import { occasionMessage, whatsappUrl } from '@/config/site';
import { occasions } from '@/data/funnel';
import { Arrow } from '@/components/shared/Arrow';
import { OpensWhatsApp, whatsappLinkProps } from '@/components/shared/whatsapp';

/** Interesse: onde a marca do cliente vai aparecer; cada ocasião já abre o orçamento certo. */
export function Occasions() {
  return (
    <section id="ocasioes" aria-labelledby="ocasioes-titulo" className="border-t border-line bg-paper py-section">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-label text-soft">Para cada ocasião</p>
            <h2 id="ocasioes-titulo" className="mt-4 text-display-2">
              A Linha Office para cada momento da empresa.
            </h2>
          </div>
          <p className="text-lead text-soft lg:col-span-4 lg:col-start-9">
            Os mesmos itens funcionam como presente, ferramenta de trabalho e lembrança da sua marca.
          </p>
        </div>
        <ul role="list" className="mt-14 grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {occasions.map((occasion) => (
            <li key={occasion.title} className="group relative flex flex-col bg-paper p-6 transition-colors hover:bg-white lg:p-8">
              <span aria-hidden="true" className={`block h-1.5 w-10 transition-[width] duration-300 group-hover:w-16 ${occasion.color}`} />
              <h3 className="mt-6 text-display-3">{occasion.title}</h3>
              <p className="mt-3 flex-1 text-body text-soft">{occasion.text}</p>
              <a
                href={whatsappUrl(occasionMessage(occasion.request))}
                {...whatsappLinkProps}
                className="mt-6 inline-flex items-center gap-2 font-bold underline decoration-ink/25 underline-offset-[6px] transition-colors hover:decoration-ink after:absolute after:inset-0"
              >
                Pedir orçamento
                <Arrow direction="upright" />
                <span className="sr-only">{` para ${occasion.title.toLowerCase()}`}</span>
                <OpensWhatsApp />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
