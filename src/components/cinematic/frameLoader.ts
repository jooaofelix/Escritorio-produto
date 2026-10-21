/**
 * Carregador progressivo da sequência de frames.
 *
 * - O primeiro frame tem prioridade (`loadFirst`, fetchPriority high — já vem do preload do index.html).
 * - Depois, em passes coarse-to-fine (a cada 16, 8, 4, 2, todos) com concorrência limitada; dentro de
 *   cada pass, o frame mais próximo do ponto atual da rolagem vem primeiro.
 * - Mantém apenas HTMLImageElement (comprimido; o navegador pode descartar o bitmap decodificado),
 *   sem ImageBitmap por frame.
 * - Com Save-Data / 2G, só os passes grossos.
 */

const PENDING = 0;
const LOADING = 1;
const READY = 2;
const FAILED = 3;

const FULL_STEPS = [16, 8, 4, 2, 1] as const;
const LITE_STEPS = [16, 8, 4] as const;

interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

export function prefersReducedData(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!connection) return false;
  return connection.saveData === true || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
}

export interface FrameLoaderOptions {
  readonly concurrency: number;
  /** Só passes grossos (economia de dados). */
  readonly lite: boolean;
  /** Chamado quando um frame termina de carregar e decodificar. */
  readonly onLoad: (index: number) => void;
}

function buildPasses(count: number, steps: readonly number[]): number[][] {
  const seen = new Uint8Array(count);
  const passes: number[][] = [];
  steps.forEach((step, p) => {
    const pass: number[] = [];
    for (let i = 0; i < count; i += step) {
      if (!seen[i]) {
        seen[i] = 1;
        pass.push(i);
      }
    }
    // O último frame entra já no primeiro pass: é o estado final do pin (capítulo 4 + CTA).
    if (p === 0 && !seen[count - 1]) {
      seen[count - 1] = 1;
      pass.push(count - 1);
    }
    if (pass.length) passes.push(pass);
  });
  return passes;
}

export class FrameLoader {
  readonly count: number;
  private readonly images: (HTMLImageElement | undefined)[];
  private readonly state: Uint8Array;
  private readonly passes: number[][];
  private readonly inflight = new Set<HTMLImageElement>();
  private active = 0;
  private focus = 0;
  private started = false;
  private disposed = false;

  constructor(
    private readonly urls: readonly string[],
    private readonly options: FrameLoaderOptions,
  ) {
    this.count = urls.length;
    this.images = new Array<HTMLImageElement | undefined>(this.count);
    this.state = new Uint8Array(this.count);
    this.passes = buildPasses(this.count, options.lite ? LITE_STEPS : FULL_STEPS);
  }

  /** Carrega o primeiro frame com prioridade alta (uma nova tentativa em caso de falha). */
  async loadFirst(): Promise<void> {
    try {
      await this.fetch(0, 'high');
    } catch {
      if (this.disposed) return;
      this.state[0] = PENDING;
      await this.fetch(0, 'high');
    }
  }

  /** Inicia o carregamento progressivo do restante (idempotente). */
  start(): void {
    if (this.started || this.disposed) return;
    this.started = true;
    this.pump();
  }

  /** Índice de arquivo próximo da rolagem atual: prioriza os vizinhos dentro do pass corrente. */
  setFocus(index: number): void {
    this.focus = index;
  }

  get(index: number): HTMLImageElement | undefined {
    return this.state[index] === READY ? this.images[index] : undefined;
  }

  /** Índice do frame carregado mais próximo de `index` (-1 se nenhum). */
  nearest(index: number): number {
    if (this.state[index] === READY) return index;
    for (let d = 1; d < this.count; d++) {
      const before = index - d;
      const after = index + d;
      if (before >= 0 && this.state[before] === READY) return before;
      if (after < this.count && this.state[after] === READY) return after;
      if (before < 0 && after >= this.count) break;
    }
    return -1;
  }

  dispose(): void {
    this.disposed = true;
    // Trocar o src cancela as requisições em andamento.
    this.inflight.forEach((img) => {
      img.src = '';
    });
    this.inflight.clear();
    this.images.fill(undefined);
  }

  private pump(): void {
    while (!this.disposed && this.active < this.options.concurrency) {
      const index = this.next();
      if (index < 0) return;
      this.active++;
      this.fetch(index, 'low')
        .catch(() => {
          /* frame ausente: o player desenha o vizinho carregado mais próximo */
        })
        .finally(() => {
          this.active--;
          this.pump();
        });
    }
  }

  private next(): number {
    while (this.passes.length) {
      const pass = this.passes[0]!;
      let bestK = -1;
      let bestDistance = Infinity;
      for (let k = 0; k < pass.length; k++) {
        const index = pass[k]!;
        if (this.state[index] !== PENDING) continue;
        const distance = Math.abs(index - this.focus);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestK = k;
        }
      }
      if (bestK >= 0) return pass.splice(bestK, 1)[0]!;
      this.passes.shift();
    }
    return -1;
  }

  private fetch(index: number, priority: 'high' | 'low'): Promise<void> {
    if (this.state[index] === READY) return Promise.resolve();
    this.state[index] = LOADING;
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = priority;
    this.inflight.add(img);
    img.src = this.urls[index]!;
    return img
      .decode()
      .catch(() => {
        // decode() pode rejeitar mesmo com a imagem utilizável (ex.: troca de documento); confere o estado real.
        if (!img.complete || img.naturalWidth === 0) throw new Error(`Frame ${index + 1} não carregou`);
      })
      .then(
        () => {
          this.inflight.delete(img);
          if (this.disposed) return;
          this.images[index] = img;
          this.state[index] = READY;
          this.options.onLoad(index);
        },
        (error: unknown) => {
          this.inflight.delete(img);
          if (!this.disposed) this.state[index] = FAILED;
          throw error;
        },
      );
  }
}
