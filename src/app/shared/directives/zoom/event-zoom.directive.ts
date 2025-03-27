import {Directive, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appEventZoom]'
})
export class EventZoomDirective {

  @Output('appEventZoom') zoomEvent = new EventEmitter<boolean>();
  // @Output() minus = new EventEmitter();

  private ctrlPressed: boolean = false;

  constructor() { }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.ctrlPressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.ctrlPressed = false;
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.ctrlPressed) {
      event.preventDefault();
      this.zoomEvent.emit(event.deltaY > 0);
    }
  }
}
