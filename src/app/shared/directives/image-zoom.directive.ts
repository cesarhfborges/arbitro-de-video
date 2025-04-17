import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[appImageZoom]'
})
export class ImageZoomDirective {
  @Input('appImageZoom') enabled = false;
  @Input('appImageZoomSrc') src: string | null = null;
  @Input('appImageZoomSize') size: number = 150;
  @Input('appImageZoomLevel') level: number = 2;

  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private zoomCanvas: HTMLCanvasElement | null = null;
  private zoomCtx: CanvasRenderingContext2D | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    if (this.el.nativeElement.tagName === 'CANVAS') {
      this.canvasElement = this.el.nativeElement;
      this.ctx = this.canvasElement.getContext('2d');
    } else {
      console.error('A diretiva appImageZoom só pode ser usada em elementos <canvas>');
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    if (this.enabled && this.ctx) {
      this.createZoomCanvas();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.enabled || !this.ctx || !this.zoomCanvas || !this.zoomCtx) {
      return;
    }
    const rect = this.canvasElement.getBoundingClientRect();
    const transform = getComputedStyle(this.canvasElement).transform;
    let scaleX = 1;
    let scaleY = 1;
    if (transform && transform !== 'none') {
      const match = transform.match(/matrix\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(parseFloat);
        scaleX = values[0];
        scaleY = values[3];
      }
    }
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const x = mouseX / scaleX;
    const y = mouseY / scaleY;
    const zoomSize = this.size / this.level;
    const sx = Math.max(0, Math.min(this.canvasElement.width - zoomSize, x - zoomSize / 2));
    const sy = Math.max(0, Math.min(this.canvasElement.height - zoomSize, y - zoomSize / 2));
    this.zoomCtx.clearRect(0, 0, this.size, this.size);
    this.zoomCtx.imageSmoothingEnabled = false;
    this.zoomCtx.drawImage(
      this.canvasElement,
      sx,
      sy,
      zoomSize,
      zoomSize,
      0,
      0,
      this.size,
      this.size
    );
    this.renderer.setStyle(this.zoomCanvas, 'right', '20px');
    this.renderer.setStyle(this.zoomCanvas, 'top', '20px');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.zoomCanvas) {
      this.renderer.removeChild(this.el.nativeElement.parentElement, this.zoomCanvas);
      this.zoomCanvas = null;
      this.zoomCtx = null;
    }
  }

  private createZoomCanvas(): void {
    this.zoomCanvas = this.renderer.createElement('canvas') as HTMLCanvasElement;
    this.renderer.setStyle(this.zoomCanvas, 'position', 'absolute');
    this.renderer.setStyle(this.zoomCanvas, 'pointerEvents', 'none');
    this.renderer.setStyle(this.zoomCanvas, 'border', '2px solid #000000');
    this.renderer.setStyle(this.zoomCanvas, 'zIndex', '1000');
    this.renderer.setStyle(this.zoomCanvas, 'boxShadow', '3px 3px 8px 0px rgba(0,0,0,1)');
    this.zoomCanvas.width = this.size;
    this.zoomCanvas.height = this.size;
    this.zoomCtx = this.zoomCanvas.getContext('2d');
    this.renderer.appendChild(this.el.nativeElement.parentElement, this.zoomCanvas);
  }
}
