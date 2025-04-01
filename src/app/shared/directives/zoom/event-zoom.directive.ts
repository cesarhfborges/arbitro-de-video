import {Directive, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appEventZoom]'
})
export class EventZoomDirective {

  @Output('appEventZoom') zoomEvent = new EventEmitter<boolean>();
  @Output() verticalScroll = new EventEmitter<boolean>();
  @Output() horizontalScroll = new EventEmitter<boolean>();
  // @Output() minus = new EventEmitter();

  private ctrlPressed: boolean = false;
  private shiftPressed: boolean = false;

  constructor() { }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log('in', event.key);
    if (event.key === 'Control') {
      this.ctrlPressed = true;
    }
    if (event.key === 'Shift') {
      this.shiftPressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.ctrlPressed = false;
    }
    if (event.key === 'Shift') {
      this.shiftPressed = false;
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (this.shiftPressed) {
      this.horizontalScroll.emit(event.deltaY > 0);
    } else if (this.ctrlPressed) {
      this.zoomEvent.emit(event.deltaY < 0);
    } else {
      this.verticalScroll.emit(event.deltaY < 0);
    }
  }
}
