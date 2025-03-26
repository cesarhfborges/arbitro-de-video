import {Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[appImageControls]'
})
export class ImageControlsDirective implements OnChanges {

  @Input('appImageControls') zoomLevel: number = 100;
  @Input() scrollX: number = 0;
  @Input() scrollY: number = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.applyTransform();
  }

  private applyTransform() {
    const scaleValue = this.zoomLevel / 100;
    // const translateX = this.scrollX;
    // const translateY = this.scrollY;
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `scale(${scaleValue})`
    );
    this.renderer.setStyle(this.el.nativeElement, 'top', `${this.scrollY}%`);
    this.renderer.setStyle(this.el.nativeElement, 'left', `${this.scrollX}%`);
    this.renderer.setStyle(this.el.nativeElement, 'transform-origin', 'center');
    // this.renderer.setStyle(this.el.nativeElement, 'max-width', '100%');
    // this.renderer.setStyle(this.el.nativeElement, 'max-height', '100%');
    this.renderer.setStyle(this.el.nativeElement, 'object-fit', 'contain');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }
}
