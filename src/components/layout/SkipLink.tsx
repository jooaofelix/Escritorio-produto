/** `not-sr-only` zera o padding: por isso o espaçamento interno só entra no foco. */
export function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="sr-only rounded-sm border border-ink bg-paper text-small font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:inline-flex focus:min-h-11 focus:items-center focus:px-4"
    >
      Pular para o conteúdo
    </a>
  );
}
