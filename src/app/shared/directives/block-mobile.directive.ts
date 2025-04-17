import {Directive, ElementRef, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[appBlockMobile]'
})
export class BlockMobileDirective implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    if (isMobile) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
      const element = this.renderer.createElement('div');
      this.renderer.setStyle(element, 'height', '100%');
      this.renderer.setStyle(element, 'display', 'flex');
      this.renderer.setStyle(element, 'flex-direction', 'column');
      this.renderer.setStyle(element, 'align-items', 'center');
      this.renderer.setStyle(element, 'justify-content', 'center');

      this.renderer.setStyle(
        element,
        'background',
        'radial-gradient(circle 950px at 2.5% 8%,  rgba(44,103,176,1) 0%, rgba(35,56,136,1) 90%)'
      );

      const message = this.renderer.createElement('p');
      this.renderer.setStyle(message, 'padding', '8px 16px');
      this.renderer.setStyle(message, 'margin', '0');
      this.renderer.setStyle(message, 'color', '#ffffff');
      this.renderer.setStyle(message, 'border', '1px solid #ffffff');
      this.renderer.setStyle(message, 'border-radius', '6px');
      this.renderer.setProperty(message, 'innerText', 'Acesso via dispositivo móvel não permitido.');

      this.renderer.appendChild(element, message);
      this.renderer.appendChild(this.el.nativeElement, element);
    }
  }
}
