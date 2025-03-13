import {ElementRef} from '@angular/core';
import {OffsideAnalysisDirective} from './offside-analysis.directive';


describe('OffsideAnalisysDirective', () => {
  it('should create an instance', () => {
    const directive = new OffsideAnalysisDirective({} as ElementRef);
    expect(directive).toBeTruthy();
  });
});
