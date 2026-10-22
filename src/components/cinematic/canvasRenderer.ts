export interface CoverBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Retângulo de desenho equivalente a `object-fit: cover` centrado (o mesmo do pôster `<img>`):
 * no painel 9:16 do layout largo é o quadro inteiro; em tela cheia corta só as bordas.
 */
export function coverBox(viewWidth: number, viewHeight: number, imageWidth: number, imageHeight: number): CoverBox {
  const scale = Math.max(viewWidth / imageWidth, viewHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { x: (viewWidth - width) / 2, y: (viewHeight - height) / 2, width, height };
}

/** Canvas 2D opaco com DPR limitado. Só desenha quando pedido. */
export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly sourceWidth: number,
    private readonly sourceHeight: number,
  ) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D indisponível');
    this.ctx = ctx;
  }

  /**
   * Ajusta o backing store ao tamanho CSS atual. O DPR é limitado por `maxDpr` e também pela
   * densidade da própria fonte: acima de 1 px de fonte por px de dispositivo não há ganho de nitidez,
   * só custo de memória e de preenchimento. Retorna true se o canvas foi limpo (precisa redesenhar).
   */
  resize(maxDpr: number): boolean {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (!width || !height) return false;
    const coverScale = Math.max(width / this.sourceWidth, height / this.sourceHeight);
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, maxDpr, 1 / coverScale));
    const backingWidth = Math.round(width * dpr);
    const backingHeight = Math.round(height * dpr);
    if (this.canvas.width === backingWidth && this.canvas.height === backingHeight) return false;
    this.canvas.width = backingWidth;
    this.canvas.height = backingHeight;
    return true;
  }

  draw(image: HTMLImageElement): void {
    const { width, height } = this.canvas;
    if (!width || !height) return;
    const box = coverBox(width, height, image.naturalWidth, image.naturalHeight);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(image, box.x, box.y, box.width, box.height);
  }
}
