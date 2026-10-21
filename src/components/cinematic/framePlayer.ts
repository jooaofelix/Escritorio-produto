import { CanvasRenderer, coverBox } from './canvasRenderer';
import { FrameLoader, prefersReducedData } from './frameLoader';
import type { FrameSet } from './frames';

export interface PlayerLayout {
  readonly maxDpr: number;
  /** Ponto focal X (0–1) para um frame do vídeo. */
  readonly focalAt: (frame: number) => number;
}

export interface PlayerElements {
  readonly canvas: HTMLCanvasElement;
  /** `<img>` do primeiro frame, visível até o primeiro desenho no canvas. */
  readonly poster: HTMLImageElement | null;
}

const CONCURRENCY = 6;

function scheduleIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 250);
  return () => window.clearTimeout(id);
}

/**
 * Liga o carregador ao canvas: recebe o frame (float, em frames do vídeo) vindo da timeline,
 * converte para o índice de arquivo do conjunto e só redesenha quando esse índice muda
 * (ou quando chega um frame carregado mais próximo do desejado, ou após resize).
 */
export class FramePlayer {
  private readonly loader: FrameLoader;
  private readonly renderer: CanvasRenderer;
  private layout: PlayerLayout = { maxDpr: 1, focalAt: () => 0.5 };
  private frame = 0;
  private want = 0;
  private drawn = -1;
  private dirty = true;
  private ready = false;
  private disposed = false;
  private raf = 0;
  private cancelIdle: (() => void) | null = null;

  constructor(
    private readonly elements: PlayerElements,
    private readonly set: FrameSet,
  ) {
    this.renderer = new CanvasRenderer(elements.canvas, set.width, set.height);
    this.loader = new FrameLoader(set.urls, {
      concurrency: CONCURRENCY,
      lite: prefersReducedData(),
      onLoad: (index) => this.handleLoad(index),
    });
  }

  /** Carrega e desenha o primeiro frame; depois agenda (em idle) o carregamento progressivo. Rejeita se o primeiro frame falhar. */
  async start(): Promise<void> {
    try {
      await this.loader.loadFirst();
    } catch (error) {
      if (this.disposed) return;
      throw error;
    }
    if (this.disposed) return;
    this.ready = true;
    this.renderer.resize(this.layout.maxDpr);
    this.dirty = true;
    this.render();
    this.elements.canvas.style.opacity = '1';
    if (this.elements.poster) this.elements.poster.style.visibility = 'hidden';
    this.cancelIdle = scheduleIdle(() => {
      this.cancelIdle = null;
      this.loader.start();
    });
  }

  setLayout(layout: PlayerLayout): void {
    this.layout = layout;
    this.resize();
  }

  /** Chamado a cada atualização da timeline (já dentro do rAF do ticker do GSAP). */
  setFrame(frame: number): void {
    this.frame = frame;
    const index = Math.min(this.set.urls.length - 1, Math.max(0, Math.round(frame / this.set.step)));
    if (index === this.want) return;
    this.want = index;
    this.loader.setFocus(index);
    this.render();
  }

  /** Recalcula o backing store (tamanho/orientação/DPR) e redesenha o frame atual. */
  resize(): void {
    if (this.disposed) return;
    this.renderer.resize(this.layout.maxDpr);
    this.dirty = true;
    this.syncPoster();
    this.render();
  }

  dispose(): void {
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.cancelIdle?.();
    this.loader.dispose();
    this.elements.canvas.style.opacity = '';
    if (this.elements.poster) {
      this.elements.poster.style.visibility = '';
      this.elements.poster.style.objectPosition = '';
    }
  }

  private render(): void {
    if (!this.ready || this.disposed) return;
    const index = this.loader.nearest(this.want);
    if (index < 0 || (index === this.drawn && !this.dirty)) return;
    const image = this.loader.get(index);
    if (!image) return;
    this.renderer.draw(image, this.layout.focalAt(this.frame));
    this.drawn = index;
    this.dirty = false;
  }

  private handleLoad(index: number): void {
    if (!this.ready || this.drawn === this.want) return;
    if (Math.abs(index - this.want) >= Math.abs(this.drawn - this.want)) return;
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.render();
    });
  }

  /** Mantém o pôster alinhado ao mesmo enquadramento do canvas (sem salto no primeiro desenho). */
  private syncPoster(): void {
    const poster = this.elements.poster;
    if (!poster || this.ready) return;
    const { cssWidth, cssHeight } = this.renderer;
    if (!cssWidth || !cssHeight) return;
    const box = coverBox(cssWidth, cssHeight, this.set.width, this.set.height, this.layout.focalAt(this.frame));
    poster.style.objectPosition = `${box.x}px ${box.y}px`;
  }
}
