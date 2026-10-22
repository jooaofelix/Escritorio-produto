const PILLARS = [
  {
    title: 'Papelaria personalizada',
    text: 'Agendas, cadernos e materiais com a capa e as páginas na identidade da sua marca.',
    color: 'bg-coral',
  },
  {
    title: 'Brindes corporativos',
    text: 'Kits para presentear clientes, parceiros e equipes com a sua marca.',
    color: 'bg-sun',
  },
  {
    title: 'Acessórios para escritório',
    text: 'Porta-canetas, suporte de celular, organizadores e porta-clipes para o escritório.',
    color: 'bg-mint',
  },
] as const;

export function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="on-light py-section">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-label text-soft">Sobre a Coloridamente</p>
            <h2 id="sobre-titulo" className="mt-4 text-display-2">
              Produtos que levam a sua marca para o dia a dia.
            </h2>
          </div>
          <p className="text-lead text-soft lg:col-span-5 lg:col-start-8 lg:self-end">
            A Coloridamente cria agendas, cadernos, papelaria corporativa, brindes e acessórios para escritório com a
            identidade visual da sua empresa, do primeiro contato ao produto pronto para usar ou presentear.
          </p>
        </div>
        <ul role="list" className="mt-14 grid gap-10 border-t border-line pt-10 sm:grid-cols-3 lg:mt-20">
          {PILLARS.map((pillar) => (
            <li key={pillar.title}>
              <span aria-hidden="true" className={`block h-1.5 w-10 ${pillar.color}`} />
              <h3 className="mt-5 text-display-3">{pillar.title}</h3>
              <p className="mt-3 max-w-[36ch] text-body text-soft">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
