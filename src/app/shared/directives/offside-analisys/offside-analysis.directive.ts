import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
const numeric = require('./../../../../assets/js/numeric-1.2.6_stripped');

@Directive({
  selector: '[appOffsideAnalysis]'
})
export class OffsideAnalysisDirective implements OnInit {
  @Input() imageSrc: string;

  private ogCbr: DOMRect;
  private cntn: HTMLElement;
  private redSw: HTMLElement;
  private rfH: HTMLInputElement;
  private rfHLbl: HTMLElement;
  private rfV: HTMLInputElement;
  private rfVLbl: HTMLElement;
  private rfHVLbl: HTMLElement;
  private scr = 0;
  private dfl = false;
  private isMouseDown = false;
  private angl = 0;
  private anglsH = { red: null, blue: null };
  private anglsV = { red: null, blue: null };
  private refanglsH = { red: null, blue: null };
  private refAnglsV = { red: null, blue: null };
  private p = { x: 0, y: 0 };
  private currRed = false;
  private lastBlueXY = { x: null, y: null };
  private lastRedXY = { x: null, y: null };
  private lkln: HTMLInputElement;
  private vTstImg: HTMLInputElement;
  private imge: HTMLImageElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private canvas1: HTMLCanvasElement;
  private ctx1: CanvasRenderingContext2D;
  private canvas2: HTMLCanvasElement;
  private ctx2: CanvasRenderingContext2D;
  private points: number[][];
  private drag: number = null;
  private prx = 15;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.cntn = this.el.nativeElement;
    this.redSw = document.getElementById('cRedSw');
    this.rfH = document.getElementById('refDistH') as HTMLInputElement;
    this.rfHLbl = document.getElementById('refDistHLbl');
    this.rfV = document.getElementById('refDistV') as HTMLInputElement;
    this.rfVLbl = document.getElementById('refDistVLbl');
    this.rfHVLbl = document.getElementById('refDistHVLbl');
    this.lkln = document.getElementById('lkl') as HTMLInputElement;
    this.vTstImg = document.getElementById('tstImg') as HTMLInputElement;
    this.imge = document.getElementById('imge') as HTMLImageElement;

    this.vTstImg.addEventListener('change', this.handleFile.bind(this), false);

    this.initializeCanvas();
  }

  private initializeCanvas(): void {
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setAttribute(this.canvas, 'id', 'canvas');
    this.renderer.setAttribute(this.canvas, 'class', 'canvas');
    this.renderer.appendChild(this.cntn, this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.canvas1 = this.renderer.createElement('canvas');
    this.ctx1 = this.canvas1.getContext('2d');

    this.canvas2 = this.renderer.createElement('canvas');
    this.ctx2 = this.canvas2.getContext('2d');

    this.points = [
      [this.canvas.width * 0.2, this.canvas.height * 0.8],
      [this.canvas.width * 0.8, this.canvas.height * 0.8],
      [this.canvas.width * 0.8, this.canvas.height * 0.2],
      [this.canvas.width * 0.2, this.canvas.height * 0.2],
      [this.canvas.width * 0.4, this.canvas.height * 0.2],
      [this.canvas.width * 0.5, this.canvas.height * 0.6]
    ];

    this.prepareLines(this.ctx2, this.points);
    this.drawCanvas(this.ctx, this.ctx1, this.ctx2);
  }

  private handleFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    const url = URL.createObjectURL(file);

    this.imge.addEventListener('load', () => {
      this.ogCbr = this.cntn.getBoundingClientRect();

      const tmpCvs = Array.from(document.getElementsByTagName('CANVAS'));

      if (tmpCvs.length > 0) {
        tmpCvs.forEach(canvas => canvas.remove());
      }

      this.canvas.width = this.imge.width;
      this.canvas.height = this.imge.height;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.imge, 0, 0, this.imge.width, this.imge.height);

      this.actStart();
    }, false);

    this.imge.src = url;
  }

  private actStart(): void {
    document.getElementById('gmi').onclick = () => this.gmi();
    this.rfH.oninput = () => this.switcher();
    this.rfV.oninput = () => this.switcher();
    document.getElementById('dflip').onclick = () => {
      this.dfl = !this.dfl;
      this.switcher();
    };

    this.redSw.onclick = () => {
      if (this.currRed) {
        this.redSw.style.setProperty('background', 'mediumblue', 'important');
      } else {
        this.redSw.style.setProperty('background', '#f00000', 'important');
      }

      this.redSw.innerText = (this.currRed) ? 'Blue' : 'Red';
      this.currRed = (this.currRed) ? false : true;
    };

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.canvas.addEventListener('mouseleave', (event) => {
      document.body.style.setProperty('cursor', '');
    }, false);

    this.canvas.addEventListener('mouseenter', (event) => {
      if (this.isMouseDown) {
        document.body.style.setProperty('cursor', 'none');
      }
    }, false);

    window.addEventListener('mouseup', (event) => {
      this.isMouseDown = false;
      document.body.style.setProperty('cursor', '');
    }, false);

    window.addEventListener('mousedown', (event) => {
      this.isMouseDown = true;

      if (event.target === this.canvas) {
        document.body.style.setProperty('cursor', 'none');
        this.canvas.width = this.imge.clientWidth;
        this.canvas.height = this.imge.clientHeight;

        this.canvas1.width = this.imge.clientWidth;
        this.canvas1.height = this.imge.clientHeight;

        this.canvas2.width = this.imge.clientWidth;
        this.canvas2.height = this.imge.clientHeight;
        event.preventDefault();
        this.p = this.getMousePosition(event);
        for (let i = 0; i < 4; i++) {
          const x = this.points[i][0];
          const y = this.points[i][1];
          if (this.p.x < x + this.prx && this.p.x > x - this.prx && this.p.y < y + this.prx && this.p.y > y - this.prx) {
            this.drag = i;
          }
        }

        for (let i = 4; i < 6; i++) {
          const x = this.points[i][0];
          const y = this.points[i][1];
          if (this.p.x < x + this.prx && this.p.x > x - this.prx && this.p.y < y + this.prx && this.p.y > y - this.prx) {
            this.drag = i;
          }
        }

        this.switcher();
      }
    }, false);

    this.canvas.addEventListener('mousemove', (event) => {
      if (event.which === 1) {
        this.p = this.getMousePosition(event);
        this.switcher();
      }

      event.preventDefault();
      if (this.drag !== null) {
        this.points[this.drag][0] = this.p.x;
        this.points[this.drag][1] = this.p.y;
        this.prepareLines(this.ctx2, this.points);
        this.drawCanvas(this.ctx, this.ctx1, this.ctx2);
      }
    }, false);

    this.canvas.addEventListener('wheel', (event) => {
      if (event.shiftKey) {
        event.preventDefault();
        this.redSw.click();
      } else if (!event.ctrlKey) {
        event.preventDefault();
        this.scr = (this.scr + (event.deltaY / event.deltaY)) % 6;
        this.switcher();
      }
    }, false);

    this.canvas.addEventListener('mouseup', (event) => {
      event.preventDefault();
      this.drag = null;
      this.prepareLines(this.ctx2, this.points);
      this.ctx.drawImage(this.ctx1.canvas, 0, 0);
      this.ctx.drawImage(this.ctx2.canvas, 0, 0);
    }, false);

    this.canvas.addEventListener('mouseout', (event) => {
      event.preventDefault();
      this.drag = null;
    }, false);

    this.canvas.addEventListener('mouseenter', (event) => {
      event.preventDefault();
      this.drag = null;
    }, false);
  }

  private prepareLines(ctx: CanvasRenderingContext2D, p: number[][]): void {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.lineTo(p[3][0], p[3][1]);
    ctx.closePath();
    ctx.strokeStyle = '#cf17ff';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p[1][0], p[1][1]);
    ctx.lineTo(p[2][0], p[2][1]);
    ctx.closePath();
    ctx.strokeStyle = '#cf17ff';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p[3][0], p[3][1]);
    ctx.lineTo(p[2][0], p[2][1]);
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.lineTo(p[1][0], p[1][1]);
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = (i === this.drag) ? '#6aff00' : '#00ffff';
      ctx.beginPath();
      ctx.arc(p[i][0], p[i][1], 3, 0, Math.PI * 2, true);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawCanvas(ctx: CanvasRenderingContext2D, ctx1: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(ctx1.canvas, 0, 0);
    ctx.drawImage(ctx2.canvas, 0, 0);
  }

  private getMousePosition(event: MouseEvent): { x: number; y: number } {
    if (this.lkln.checked) {
      this.cntn.style.cssText = '';
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const oX = event.clientX - rect.left;
      const oY = event.clientY - rect.top;
      if (this.scr > 1) {
        this.cntn.style.cssText = `transform: rotate(${this.angl}rad);`;
        const cbr = this.cntn.getBoundingClientRect();
        this.cntn.style.cssText =
          `transform: rotate(${this.angl}rad) translate(${this.ogCbr.left - cbr.left}px, ${this.ogCbr.top - cbr.top}px);`;
      }
      return { x: oX, y: oY };
    } else {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    colour: string,
    w: number
  ): void {
    try {
      ctx.beginPath();
      ctx.strokeStyle = colour;
      ctx.lineWidth = w;
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } catch (e) {
      console.error(e);
    }
  }

  private toBorders(
    from: { x: number; y: number },
    to: { x: number; y: number },
    left: number,
    right: number,
    top: number,
    bottom: number
  ): { x: number; y: number }[] {
    const x = [from.x, to.x - from.x];
    const y = [from.y, to.y - from.y];
    const lambdaAt: any = {};

    if (x[1] === 0) {
      lambdaAt.l = null;
      lambdaAt.r = null;
    } else {
      const i = 1 / x[1];
      lambdaAt.l = (left - x[0]) * i;
      lambdaAt.r = (right - x[0]) * i;
    }

    if (y[1] === 0) {
      lambdaAt.t = null;
      lambdaAt.b = null;
    } else {
      const i = 1 / y[1];
      lambdaAt.t = (top - y[0]) * i;
      lambdaAt.b = (bottom - y[0]) * i;
    }

    const xAT = {
      t: (lambdaAt.t === null) ? x[0] : x[0] + lambdaAt.t * x[1],
      b: (lambdaAt.b === null) ? x[0] : x[0] + lambdaAt.b * x[1],
    };

    const yAT = {
      l: (lambdaAt.l === null) ? y[0] : y[0] + lambdaAt.l * y[1],
      r: (lambdaAt.r === null) ? y[0] : y[0] + lambdaAt.r * y[1],
    };

    const poss = [[xAT.t, top], [xAT.b, bottom], [left, yAT.l], [right, yAT.r]];
    let c = 0;
    const outs = [];

    for (let k = 0; k < 4; ++k) {
      if (poss[k][0] >= left && poss[k][0] <= right && poss[k][1] >= top && poss[k][1] <= bottom) {
        const p = { x: poss[k][0], y: poss[k][1] };
        const clsh = (c === 1 && outs[0].x === p.x && outs[0].y === p.y);
        if (c === 0 || !clsh) {
          outs.push(p);
          c++;
        }
      }
      if (c === 2) {
        break;
      }
    }

    return outs;
  }

  private setup(x: number, y: number, d: boolean, red: boolean, refAngl: boolean): void {
    const n = 1;
    const xy = { x, y };
    const xyq1 = { x: 0, y: 0 };
    const infn = ((this.points[3][0] === this.points[0][0]) && (this.points[2][0] === this.points[1][0]));

    if (!infn) {
      const m1 = (this.points[3][1] - this.points[0][1]) / (this.points[3][0] - this.points[0][0]);
      const m2 = (this.points[2][1] - this.points[1][1]) / (this.points[2][0] - this.points[1][0]);
      const A = [[1, -1], [m1, -m2]];
      const res = [[this.points[2][0] - this.points[0][0]], [this.points[2][1] - this.points[0][1]]];
      const g12 = numeric.solve(A, res);
      const xq1 = this.points[0][0] + g12[0];
      const yq1 = this.points[0][1] + g12[0] * m1;
      xyq1.x = xq1;
      xyq1.y = yq1;
    }

    if (infn) {
      xyq1.x = x;
      xyq1.y = 0;
    }

    const angls = [0, 0];
    const ss = red ? '#f00000' : 'mediumblue';

    if (!infn) {
      const dp = -(x - xyq1.x) / Math.abs(x - xyq1.x);
      const td = { y: Math.sin(dp) * (x - xyq1.x) + Math.cos(dp) * (y - xyq1.y) + xyq1.y };
      const anglH = Math.atan2(y - xyq1.y, xyq1.x - x);
      angls[0] = anglH;
      angls[1] = anglH - 0.5 * Math.PI;

      if (!refAngl) {
        const extendedPoints = this.toBorders(xyq1, xy, 0, this.canvas.clientWidth, 0, this.canvas.clientHeight);
        this.drawLine(this.ctx, extendedPoints[0], extendedPoints[1], ss, 0.7);
        if (d) {
          const extendedPointsV = this.toBorders({ x, y: td.y }, xy, 0, this.canvas.clientWidth, 0, this.canvas.clientHeight);
          if (this.dfl) {
            this.drawLine(this.ctx, xy, extendedPointsV[1], ss, 0.7);
          } else {
            this.drawLine(this.ctx, xy, extendedPointsV[0], ss, 0.7);
          }
        }
      }
    } else {
      this.drawLine(this.ctx, { x, y: 0 }, { x, y: this.canvas.clientHeight }, ss, 0.7);
      if ((this.scr === 4 || this.scr === 5) && d) {
        if (this.dfl) {
          this.drawLine(this.ctx, { x, y }, { x: this.canvas.clientWidth, y }, ss, 0.7);
        } else {
          this.drawLine(this.ctx, { x: 0, y }, { x, y }, ss, 0.7);
        }
      }
    }

    if (refAngl) {
      if (red) {
        this.refanglsH.red = angls[0];
      } else {
        this.refanglsH.blue = angls[0];
      }
    } else {
      if (red) {
        this.anglsH.red = angls[0];
      } else {
        this.anglsH.blue = angls[0];
      }
      if (red === this.currRed) {
        this.angl = angls[1];
      }
    }
  }

  private setupt(x: number, y: number, d: boolean, red: boolean, refAngl: boolean): void {
    const n = 1;
    const xst = [this.points[1][0], this.points[3][0], this.points[2][0], this.points[0][0]];
    const yst = [this.points[1][1], this.points[3][1], this.points[2][1], this.points[0][1]];

    const xy = { x, y };
    const xyq1 = { x: 0, y: 0 };
    const infn = ((xst[3] === xst[1]) && (xst[2] === xst[0]));

    if (!infn) {
      const m1 = (yst[3] - yst[0]) / (xst[3] - xst[0]);
      const m2 = (yst[2] - yst[1]) / (xst[2] - xst[1]);
      const A = [[1, -1], [m1, -m2]];
      const res = [[xst[2] - xst[0]], [yst[2] - yst[0]]];
      const g12 = numeric.solve(A, res);
      const xq1 = xst[0] + g12[0];
      const yq1 = yst[0] + g12[0] * m1;
      xyq1.x = xq1;
      xyq1.y = yq1;
    }

    if (infn) {
      xyq1.x = 0;
      xyq1.y = y;
    }

    const angls = [0, 0];
    const ss = red ? '#f00000' : 'mediumblue';

    if (!infn) {
      const dp = -(x - xyq1.x) / Math.abs(x - xyq1.x);
      const td = { y: Math.sin(dp) * (x - xyq1.x) + Math.cos(dp) * (y - xyq1.y) + xyq1.y };
      const anglV = Math.atan2(y - xyq1.y, xyq1.x - x);
      angls[0] = anglV;
      angls[1] = anglV - 0.5 * Math.PI;

      if (!refAngl) {
        const extendedPoints = this.toBorders(xyq1, xy, 0, this.canvas.clientWidth, 0, this.canvas.clientHeight);
        this.drawLine(this.ctx, extendedPoints[0], extendedPoints[1], ss, 0.7);
        if (d && (this.scr === 2 || this.scr === 3)) {
          const extendedPointsV = this.toBorders({ x, y: td.y }, xy, 0, this.canvas.clientWidth, 0, this.canvas.clientHeight);
          if (this.dfl) {
            this.drawLine(this.ctx, xy, extendedPointsV[1], ss, 0.7);
          } else {
            this.drawLine(this.ctx, xy, extendedPointsV[0], ss, 0.7);
          }
        }
      }
    } else {
      this.drawLine(this.ctx, { x: 0, y }, { x: this.canvas.clientWidth, y }, ss, 0.7);
      if ((this.scr === 2 || this.scr === 3) && d) {
        if (this.dfl) {
          this.drawLine(this.ctx, { x, y }, { x, y: this.canvas.clientHeight }, ss, 0.7);
        } else {
          this.drawLine(this.ctx, { x, y }, { x, y: 0 }, ss, 0.7);
        }
      }
    }

    if (refAngl) {
      if (red) {
        this.refAnglsV.red = angls[0];
      } else {
        this.refAnglsV.blue = angls[0];
      }
    } else {
      if (red) {
        this.anglsV.red = angls[0];
      } else {
        this.anglsV.blue = angls[0];
      }
      if (red === this.currRed) {
        this.angl = angls[1];
      }
    }
  }

  private switcher(): void {
    switch (this.scr) {
      case 0:
      case 1:
        this.both(this.p);
        break;
      case 2:
      case 3:
        this.lit(this.p);
        break;
      case 4:
      case 5:
        this.li(this.p);
        break;
    }
  }

  private both(p: { x: number; y: number }): void {
    let outH = 0;
    let outV = 0;
    this.prepareLines(this.ctx2, this.points);
    this.drawCanvas(this.ctx, this.ctx1, this.ctx2);

    if (this.currRed) {
      this.lastRedXY.x = p.x;
      this.lastRedXY.y = p.y;

      this.setupt(p.x, p.y, this.dfl, true, false);
      this.setup(p.x, p.y, this.dfl, true, false);

      if (this.lastBlueXY.x !== null) {
        this.setupt(this.lastBlueXY.x, this.lastBlueXY.y, this.dfl, false, false);
        this.setup(this.lastBlueXY.x, this.lastBlueXY.y, this.dfl, false, false);
      }
    } else {
      this.lastBlueXY.x = p.x;
      this.lastBlueXY.y = p.y;

      this.setupt(p.x, p.y, this.dfl, false, false);
      this.setup(p.x, p.y, this.dfl, false, false);

      if (this.lastRedXY.x !== null) {
        this.setupt(this.lastRedXY.x, this.lastRedXY.y, this.dfl, true, false);
        this.setup(this.lastRedXY.x, this.lastRedXY.y, this.dfl, true, false);
      }
    }

    if (!Number.isNaN(this.rfV.valueAsNumber)) {
      if (this.anglsV.red !== null && this.anglsV.red !== 0 && this.anglsV.blue !== null && this.anglsV.blue !== 0) {
        this.setupt(this.points[3][0], this.points[3][1], this.dfl, false, true);
        this.setupt(this.points[0][0], this.points[0][1], this.dfl, true, true);
        const neg = ((this.anglsV.blue - this.anglsV.red >= Math.PI) || (this.anglsV.red - this.anglsV.blue >= 0));
        const diff = (this.anglsV.blue - this.anglsV.red >= Math.PI)
          ? Math.abs(2 * Math.PI - this.anglsV.blue + this.anglsV.red)
          : Math.abs(this.anglsV.red - this.anglsV.blue);
        const refDiff = Math.abs(this.refAnglsV.red - this.refAnglsV.blue);
        let diff2 = (refDiff === 0) ? 0 : this.rfV.valueAsNumber * (diff / refDiff);
        diff2 = Math.abs(diff2);
        diff2 = (neg) ? -diff2 : diff2;
        outV = diff2;
        this.rfVLbl.innerText = diff2.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      } else if (this.anglsV.red === 0 && this.anglsV.blue === 0) {
        const a = Math.abs(this.points[2][0] - this.points[3][0]);
        const b = this.lastRedXY.y - this.lastBlueXY.y;
        const distV = (a === 0) ? 0 : b * (this.rfV.valueAsNumber / a);
        outV = distV;
        this.rfVLbl.innerText = distV.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      }
    }

    if (!Number.isNaN(this.rfH.valueAsNumber)) {
      if (this.anglsH.red !== null && this.anglsH.red !== 0 && this.anglsH.blue !== null && this.anglsH.blue !== 0) {
        this.setup(this.points[3][0], this.points[3][1], this.dfl, false, true);
        this.setup(this.points[2][0], this.points[2][1], this.dfl, true, true);
        const neg = ((this.anglsH.blue - this.anglsH.red >= Math.PI) || (this.anglsH.red - this.anglsH.blue >= 0));
        const diff = (this.anglsH.blue - this.anglsH.red >= Math.PI)
          ? Math.abs(2 * Math.PI - this.anglsH.blue + this.anglsH.red)
          : Math.abs(this.anglsH.red - this.anglsH.blue);
        const refDiff = Math.abs(this.refanglsH.red - this.refanglsH.blue);
        let diff2 = (refDiff === 0) ? 0 : this.rfH.valueAsNumber * (diff / refDiff);
        diff2 = Math.abs(diff2);
        diff2 = (neg) ? -diff2 : diff2;
        outH = diff2;
        this.rfHLbl.innerText = diff2.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      } else if (this.anglsH.red === 0 && this.anglsH.blue === 0) {
        const a = Math.abs(this.points[2][0] - this.points[3][0]);
        const b = this.lastRedXY.x - this.lastBlueXY.x;
        const distH = (a === 0) ? 0 : b * (this.rfH.valueAsNumber / a);
        outH = distH;
        this.rfHLbl.innerText = distH.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      }
    }

    if (!Number.isNaN(this.rfH.valueAsNumber) && !Number.isNaN(this.rfV.valueAsNumber)) {
      this.rfHVLbl.innerText = '(' + (Math.sqrt(outH * outH + outV * outV)).toLocaleString('en-GB', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 7,
        useGrouping: false
      }) + ')';
    }
  }

  private lit(p: { x: number; y: number }): void {
    this.prepareLines(this.ctx2, this.points);
    this.drawCanvas(this.ctx, this.ctx1, this.ctx2);

    if (this.currRed) {
      this.lastRedXY.x = p.x;
      this.lastRedXY.y = p.y;

      this.setupt(p.x, p.y, this.dfl, true, false);

      if (this.lastBlueXY.x !== null) {
        this.setupt(this.lastBlueXY.x, this.lastBlueXY.y, this.dfl, false, false);
      }
    } else {
      this.lastBlueXY.x = p.x;
      this.lastBlueXY.y = p.y;

      this.setupt(p.x, p.y, this.dfl, false, false);

      if (this.lastRedXY.x !== null) {
        this.setupt(this.lastRedXY.x, this.lastRedXY.y, this.dfl, true, false);
      }
    }

    this.rfHLbl.innerText = '';
    this.rfHVLbl.innerText = '';

    if (!Number.isNaN(this.rfV.valueAsNumber)) {
      if (this.anglsV.red !== null && this.anglsV.red !== 0 && this.anglsV.blue !== null && this.anglsV.blue !== 0) {
        this.setupt(this.points[3][0], this.points[3][1], this.dfl, false, true);
        this.setupt(this.points[0][0], this.points[0][1], this.dfl, true, true);
        const neg = ((this.anglsV.blue - this.anglsV.red >= Math.PI) || (this.anglsV.red - this.anglsV.blue >= 0));
        const diff = (this.anglsV.blue - this.anglsV.red >= Math.PI)
          ? Math.abs(2 * Math.PI - this.anglsV.blue + this.anglsV.red)
          : Math.abs(this.anglsV.red - this.anglsV.blue);
        const refDiff = Math.abs(this.refAnglsV.red - this.refAnglsV.blue);
        let diff2 = (refDiff === 0) ? 0 : this.rfV.valueAsNumber * (diff / refDiff);
        diff2 = Math.abs(diff2);
        diff2 = (neg) ? -diff2 : diff2;
        this.rfVLbl.innerText = diff2.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      } else if (this.anglsV.red === 0 && this.anglsV.blue === 0) {
        const a = Math.abs(this.points[2][0] - this.points[3][0]);
        const b = this.lastRedXY.y - this.lastBlueXY.y;
        const distV = (a === 0) ? 0 : b * (this.rfV.valueAsNumber / a);
        this.rfVLbl.innerText = distV.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      }
    }

    if (this.lkln.checked && this.scr > 1) {
      this.cntn.style.cssText = 'transform: rotate(' + this.angl + 'rad);';
      const cbr = this.cntn.getBoundingClientRect();
      this.cntn.style.cssText =
        'transform: rotate(' + this.angl + 'rad) translate(' + (cbr.left - this.ogCbr.left) + 'px,' + (cbr.top - this.ogCbr.top) + 'px);';
    }
  }

  private li(p: { x: number; y: number }): void {
    this.prepareLines(this.ctx2, this.points);
    this.drawCanvas(this.ctx, this.ctx1, this.ctx2);

    if (this.currRed) {
      this.lastRedXY.x = p.x;
      this.lastRedXY.y = p.y;

      this.setup(p.x, p.y, this.dfl, true, false);

      if (this.lastBlueXY.x !== null) {
        this.setup(this.lastBlueXY.x, this.lastBlueXY.y, this.dfl, false, false);
      }
    } else {
      this.lastBlueXY.x = p.x;
      this.lastBlueXY.y = p.y;

      this.setup(p.x, p.y, this.dfl, false, false);

      if (this.lastRedXY.x !== null) {
        this.setup(this.lastRedXY.x, this.lastRedXY.y, this.dfl, true, false);
      }
    }

    this.rfVLbl.innerText = '';
    this.rfHVLbl.innerText = '';

    if (!Number.isNaN(this.rfH.valueAsNumber)) {
      if (this.anglsH.red !== null && this.anglsH.red !== 0 && this.anglsH.blue !== null && this.anglsH.blue !== 0) {
        this.setup(this.points[3][0], this.points[3][1], this.dfl, false, true);
        this.setup(this.points[2][0], this.points[2][1], this.dfl, true, true);
        const neg = ((this.anglsH.blue - this.anglsH.red >= Math.PI) || (this.anglsH.red - this.anglsH.blue >= 0));
        const diff = (this.anglsH.blue - this.anglsH.red >= Math.PI)
          ? Math.abs(2 * Math.PI - this.anglsH.blue + this.anglsH.red)
          : Math.abs(this.anglsH.red - this.anglsH.blue);
        const refDiff = Math.abs(this.refanglsH.red - this.refanglsH.blue);
        let diff2 = (refDiff === 0) ? 0 : this.rfH.valueAsNumber * (diff / refDiff);
        diff2 = Math.abs(diff2);
        diff2 = (neg) ? -diff2 : diff2;
        this.rfHLbl.innerText = diff2.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      } else if (this.anglsH.red === 0 && this.anglsH.blue === 0) {
        const a = Math.abs(this.points[2][0] - this.points[3][0]);
        const b = this.lastRedXY.x - this.lastBlueXY.x;
        const distH = (a === 0) ? 0 : b * (this.rfH.valueAsNumber / a);
        this.rfHLbl.innerText = distH.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 7,
          useGrouping: false
        });
      }
    }

    if (this.lkln.checked && this.scr > 1) {
      this.cntn.style.cssText = 'transform: rotate(' + this.angl + 'rad);';
      const cbr = this.cntn.getBoundingClientRect();
      this.cntn.style.cssText =
        'transform: rotate(' + this.angl + 'rad) translate(' + (this.ogCbr.left - cbr.left) + 'px,' + (this.ogCbr.top - cbr.top) + 'px);';
    }
  }

  private gmi(): void {
    this.dfl = !this.dfl;
    this.switcher();
  }
}
