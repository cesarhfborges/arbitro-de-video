import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[appImageZoom]'
})
export class ImageZoomDirective {

  @Input('appImageZoom') enabled: boolean = false;
  @Input('appImageZoomSrc') src: string = null;
  @Input('appImageZoomSize') size: number = 2;
  private zoomElement: HTMLDivElement | null = null;
  private nativeElement: HTMLCanvasElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.nativeElement = this.el.nativeElement;
    console.log(this.nativeElement.tagName);
    if (this.nativeElement.tagName !== 'CANVAS') {
      console.error('A diretiva appImageZoom só pode ser usada em elementos <canvas></canvas>.');
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.enabled && this.src) {
      this.createZoomElement();
      this.updateZoom(null); // Inicializa a posição do zoom
    }
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (this.enabled && this.zoomElement) {
      this.updateZoom(event);
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.zoomElement) {
      this.renderer.removeChild(this.nativeElement.parentNode, this.zoomElement);
      this.zoomElement = null;
    }
  }

  private createZoomElement() {
    this.zoomElement = this.renderer.createElement('div');
    this.renderer.addClass(this.zoomElement, 'image-zoom-lens');

    const imageWidth = this.nativeElement.offsetWidth;
    const imageHeight = this.nativeElement.offsetHeight;
    const lensSize = 100; // Tamanho da lupa, ajuste conforme necessário

    this.renderer.setStyle(this.zoomElement, 'width', `${lensSize}px`);
    this.renderer.setStyle(this.zoomElement, 'height', `${lensSize}px`);
    this.renderer.setStyle(this.zoomElement, 'border', '1px solid #ccc');
    this.renderer.setStyle(this.zoomElement, 'position', 'absolute');
    this.renderer.setStyle(this.zoomElement, 'cursor', 'zoom-in');
    this.renderer.setStyle(this.zoomElement, 'background-repeat', 'no-repeat');
    // Ajuste o fator de zoom aqui
    this.renderer.setStyle(this.zoomElement, 'background-size', `${imageWidth * this.size}px ${imageHeight * this.size}px`);

    this.renderer.appendChild(this.nativeElement.parentNode, this.zoomElement);
  }

  private updateZoom(event: MouseEvent | null) {
    if (this.zoomElement && this.src && this.nativeElement.offsetWidth && this.nativeElement.offsetHeight) {
      const rect = this.nativeElement.getBoundingClientRect();
      const lensSize = this.zoomElement.offsetWidth;
      const x: number = (event ? event.clientX - rect.left - lensSize / 2 : this.nativeElement.offsetWidth / 2 - lensSize / 2) + 25;
      const y: number = (event ? event.clientY - rect.top - lensSize / 2 : this.nativeElement.offsetHeight / 2 - lensSize / 2) + 25;

      // Mantém a lupa dentro dos limites da imagem
      const maxX = this.nativeElement.offsetWidth - lensSize;
      const maxY = this.nativeElement.offsetHeight - lensSize;
      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));

      this.renderer.setStyle(this.zoomElement, 'left', `${boundedX}px`);
      this.renderer.setStyle(this.zoomElement, 'top', `${boundedY}px`);

      // Atualiza o background do elemento de zoom
      const bgX = -boundedX * this.size; // Ajuste o fator de zoom aqui (deve ser o mesmo do background-size)
      const bgY = -boundedY * this.size;
      this.renderer.setStyle(this.zoomElement, 'backgroundImage', `url('${this.src}')`);
      this.renderer.setStyle(this.zoomElement, 'backgroundPosition', `${bgX}px ${bgY}px`);
    }
  }

}
