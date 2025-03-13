import {TestBed} from '@angular/core/testing';
import { ImageControlsDirective } from './image-controls.directive';
import {ElementRef, Renderer2} from '@angular/core';

class MockElementRef extends ElementRef {}

describe('ImageControlsDirective', () => {

  let image: ElementRef;
  let renderer: Renderer2;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        //more providers
        { provide: ElementRef, useClass: MockElementRef }
      ]
    });
    await TestBed.compileComponents();
    image = TestBed.inject(ElementRef);
    renderer = TestBed.inject(Renderer2);
  });

  it('should create an instance', () => {
    const directive = new ImageControlsDirective(image, renderer);
    expect(directive).toBeTruthy();
  });
});
