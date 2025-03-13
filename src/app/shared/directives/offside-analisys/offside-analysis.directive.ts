import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[appOffsideAnalysis]'
})
export class OffsideAnalysisDirective {

  OG_cbr: any = null;

  container: Element;

  constructor(
    private el: ElementRef,
  ) {
    console.log(this.el);
    this.container = this.el.nativeElement;
  }

  // private handleFile(e: any) {
  //   let mp_ct = 0;
  //   let mp_ct_s = 0;
  //   let url = URL.createObjectURL(e.target.files[0]);
  //   let imge = document.getElementById('imge');
  //
  //   imge.addEventListener('load', () => {
  //
  //
  //     this.OG_cbr = this.container.getBoundingClientRect();
  //
  //     let tmp_cvs = [...document.getElementsByTagName('CANVAS')];
  //
  //     if (tmp_cvs.length > 0) {
  //       for (let i = 0; i < tmp_cvs.length; i++) {
  //         tmp_cvs[i].remove();
  //       }
  //     }
  //     let cnvs = document.createElement('CANVAS');
  //     cnvs.id = 'canvas';
  //     cnvs.className = 'canvas';
  //     this.parentElement.append(cnvs);
  //     cnvs.width = this.width;
  //     cnvs.height = this.height;
  //     let ctx = cnvs.getContext('2d');
  //     ctx.clearRect(0, 0, cnvs.width, cnvs.height);
  //     ctx.drawImage(this, 0, 0, this.width, this.height);
  //
  //     actStart();
  //   }, false);
  //   imge.src = url;
  // }
}
