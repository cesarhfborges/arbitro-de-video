import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ContextService} from '../../shared/services/context.service';
import {fakerPT_BR} from '@faker-js/faker';

interface IPosition {
  x: number;
  y: number;
}

interface IVertex {
  topLeft: IPosition;
  topRight: IPosition;
  bottomRight: IPosition;
  bottomLeft: IPosition;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('inputShowRect') inputShowRect: ElementRef;
  @ViewChild('imageCanvas') imageCanvas!: ElementRef;

  image: HTMLImageElement | null = null;

  configs: any = {
    file: {
      accept: 'image/*, video/*',
    }
  };

  options: any = {
    imageY: 50,
    imageX: 50,
    imageZ: 80,
    showRect: true,
    imageInvertColor: false,
    grayscale: false,
    sepia: false,
    magnifier: false,
    lines: 'area',
    offSideLine: 'area',
    offside: null
  };
  protected offsideLines: { x: number; y: number; color: string; visible: boolean }[] = [];
  private reader = new FileReader();
  private ctx: CanvasRenderingContext2D;
  private isAreaDragging = false;
  private isMouseDragging = false;
  private selectedHandle: string | null = null;
  private vertices: IVertex = {
    topLeft: {x: 50, y: 50}, // Top-left
    topRight: {x: 150, y: 50}, // Top-right
    bottomRight: {x: 150, y: 150}, // Bottom-right
    bottomLeft: {x: 50, y: 150} // Bottom-left
  };
  private handleSize = 10;

  constructor(
    private contextService: ContextService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.reader.onload = (event: any) => {
      // this.image = event.target.result;
      this.image = new Image();
      this.image.onload = () => {
        this.vertices = {
          topLeft: {x: 50, y: 50},
          topRight: {x: 150, y: 50},
          bottomRight: {x: 150, y: 150},
          bottomLeft: {x: 50, y: 150}
        };
        this.createCanvas();
        // this.drawRectangle(ctx, img.width, img.height);
      };
      this.image.src = event.target.result;
      this.contextService.imageSelect(true);
    };
  }

  get imageTop(): string {
    if (this.imageCanvas) {
      const el: HTMLCanvasElement = this.imageCanvas.nativeElement;
      return `calc(${this.options.imageY}% - ${Math.round(el.height / 2)}px)`;
    }
    return '0';
  }

  get imageLeft(): string {
    if (this.imageCanvas) {
      const el: HTMLCanvasElement = this.imageCanvas.nativeElement;
      // const {width} = this.imageSizes;
      return `calc(${this.options.imageX}% - ${Math.round(el.width / 2)}px)`;
    }
    return '0';
  }

  get imageZoom(): string {
    if (this.imageCanvas) {
      return `scale(${this.options.imageZ / 100})`;
    }
    return 'scale(1)';
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    this.contextService.imageSelected().subscribe({
      next: value => {
        if (!value) {
          this.image = null;
        }
      }
    });

    // eslint-disable-next-line
    const numeric = window['numeric'];
    console.log(numeric);
  }

  handleFileInput(event: any): void {
    const files: FileList = event.target.files;
    if (!!files && files.length > 0) {
      this.reader.readAsDataURL(files[0]);
    }
  }

  onZoomIn(zoomIn: boolean): void {
    if (zoomIn) {
      this.options.imageZ += 10;
    } else {
      this.options.imageZ -= 10;
    }
  }

  onVerticalScroll(zoomIn: boolean): void {
    if (zoomIn) {
      this.options.imageY += 5;
    } else {
      this.options.imageY -= 5;
    }
  }

  onHorizontalScroll(zoomIn: boolean): void {
    if (zoomIn) {
      this.options.imageX += 5;
    } else {
      this.options.imageX -= 5;
    }
  }

  createCanvas(): void {
    this.renderer.setStyle(this.imageCanvas.nativeElement, 'position', 'absolute');
    this.renderer.setStyle(this.imageCanvas.nativeElement, 'top', 0);
    this.renderer.setStyle(this.imageCanvas.nativeElement, 'left', 0);
    this.ctx = this.imageCanvas.nativeElement.getContext('2d');

    this.updateCanvas();

    this.imageCanvas.nativeElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.imageCanvas.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.imageCanvas.nativeElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    (this.inputShowRect.nativeElement as HTMLInputElement).addEventListener('change', (event: any) => {
      // console.log(event);
      console.log(this.options.showRect);
    });
    console.log(this.inputShowRect.nativeElement);
  }


  onMouseDown(event: MouseEvent): void {
    console.log('onMouseDown');
    // this.renderer.setStyle(this.imageCanvas.nativeElement, 'cursor', 'default');
    const {offsetX, offsetY} = event;
    this.isMouseDragging = true;
    for (const i of Object.keys(this.vertices)) {
      const vertex = this.vertices[i];
      const dx = offsetX - vertex.x;
      const dy = offsetY - vertex.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.handleSize / 2) {
        this.isAreaDragging = true;
        this.selectedHandle = i;
        return;
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isMouseDragging) {
      if (this.isAreaDragging || this.selectedHandle !== null) {
        this.renderer.setStyle(this.imageCanvas.nativeElement, 'cursor', 'none');
        const {offsetX, offsetY} = event;
        this.vertices[this.selectedHandle] = {x: offsetX, y: offsetY};
        this.updateCanvas();
      } else {
        this.renderer.setStyle(this.imageCanvas.nativeElement, 'cursor', 'none');
        const {offsetX, offsetY} = event;
        if (this.options.offside !== null) {
          this.offsideLines[this.options.offside].x = offsetX;
          this.offsideLines[this.options.offside].y = offsetY;
        }
        this.updateCanvas();
      }
    } else {
      this.renderer.setStyle(this.imageCanvas.nativeElement, 'cursor', 'default');
    }
  }

  onMouseUp(): void {
    // this.renderer.setStyle(this.imageCanvas.nativeElement, 'cursor', 'default');
    this.isAreaDragging = false;
    this.selectedHandle = null;
    this.isMouseDragging = false;
    this.criarLinhaImpedimento();
  }

  // }
  addOffside(): void {
    this.offsideLines.push({
      x: -1,
      y: -1,
      color: fakerPT_BR.color.rgb(),
      visible: true
    });
    this.options.offside = this.offsideLines.length - 1;
  }

  toggleOffsideSelected(i: number) {
    if (this.options.offside === i) {
      this.options.offside = null;
    } else {
      this.options.offside = i;
    }
    this.updateCanvas();
  }

  showHiddenOffside(offsideLine: { x: number; y: number; color: string; visible: boolean }): void {
    offsideLine.visible = !offsideLine.visible;
    this.updateCanvas();
  }

  deleteOffsideLine(i: number) {
    this.offsideLines.splice(i, 1);
  }

  private updateCanvas(): void {
    this.ctx.clearRect(0, 0, this.imageCanvas.nativeElement.width, this.imageCanvas.nativeElement.height);
    this.imageCanvas.nativeElement.width = this.image.width;
    this.imageCanvas.nativeElement.height = this.image.height;
    this.ctx.drawImage(this.image, 0, 0);
    this.criarArea();
    if (!this.isAreaDragging || this.selectedHandle === null) {
      this.criarLinhaImpedimento();
    }
  }

  private criarArea(): void {
    // Desenha as linhas superior e inferior em preto
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;

    // Linha superior
    this.ctx.beginPath();
    this.ctx.moveTo(this.vertices.topLeft.x, this.vertices.topLeft.y);
    this.ctx.lineTo(this.vertices.topRight.x, this.vertices.topRight.y);
    this.ctx.stroke();
    this.ctx.closePath();

    // Linha inferior
    this.ctx.beginPath();
    this.ctx.moveTo(this.vertices.bottomRight.x, this.vertices.bottomRight.y);
    this.ctx.lineTo(this.vertices.bottomLeft.x, this.vertices.bottomLeft.y);
    this.ctx.stroke();
    this.ctx.closePath();

    // Desenha as linhas laterais em vermelho
    this.ctx.strokeStyle = 'red';
    this.ctx.beginPath();
    this.ctx.moveTo(this.vertices.topRight.x, this.vertices.topRight.y);
    this.ctx.lineTo(this.vertices.bottomRight.x, this.vertices.bottomRight.y);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.moveTo(this.vertices.bottomLeft.x, this.vertices.bottomLeft.y);
    this.ctx.lineTo(this.vertices.topLeft.x, this.vertices.topLeft.y);
    this.ctx.stroke();
    this.ctx.closePath();

    // Desenha os pontos de controle como círculos
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'transparent';
    for (const vertex of Object.keys(this.vertices)) {
      this.ctx.beginPath();
      this.ctx.arc(this.vertices[vertex].x, this.vertices[vertex].y, this.handleSize / 1.2, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  private criarLinhaImpedimento(): void {
    for (const offsideLine of this.offsideLines) {
      if (offsideLine.visible) {
        this.desenharLinhasDeProjecao(offsideLine.x, offsideLine.y, offsideLine.color);
      }
    }
  }

  private desenharLinhasDeProjecao(posX: number, posY: number, color: string): void {
    // **Captura os pontos do retângulo**
    const { topLeft, topRight, bottomLeft, bottomRight } = this.vertices;

    // **Calcular o ponto de fuga (homografia)**
    const vanishingPoint = this.calcularPontoFuga(topLeft, topRight, bottomLeft, bottomRight);

    // **Desenhar linhas projetadas**
    this.desenharLinhaComPerspectiva(posX, posY, vanishingPoint, color); // Linha horizontal
    this.desenharLinhaComPerspectiva(posX, posY, { x: 0, y: posY }, color);  // Linha vertical

    this.desenharLinhaReta(posX, posY, color);  // Linha vertical
  }

  private desenharLinhaReta(
    x: number,
    y: number,
    color: string,
    lineWidth: number = 1
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;

    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private calcularPontoFuga(
    topLeft: { x: number; y: number },
    topRight: { x: number; y: number },
    bottomLeft: { x: number; y: number },
    bottomRight: { x: number; y: number }
  ): { x: number; y: number } {
    const m1 = (bottomRight.y - topRight.y) / (bottomRight.x - topRight.x);
    const m2 = (bottomLeft.y - topLeft.y) / (bottomLeft.x - topLeft.x);

    const A = [
      [1, -1],
      [m1, -m2]
    ];
    const res = [[bottomLeft.x - topRight.x], [bottomLeft.y - topRight.y]];
    // eslint-disable-next-line
    const numeric = window['numeric'];
    const g = numeric.solve(A, res);

    return {
      x: topRight.x + g[0],
      y: topRight.y + g[0] * m1
    };
  }

  private desenharLinhaComPerspectiva(
    x: number,
    y: number,
    pontoFuga: { x: number; y: number },
    color: string,
    lineWidth: number = 1
  ): void {
    const pontos = this.encontrarExtremidades(x, y, pontoFuga.x, pontoFuga.y, this.ctx.canvas.width, this.ctx.canvas.height);

    if (pontos.length === 2) {
      this.ctx.beginPath();
      this.ctx.moveTo(pontos[0].x, pontos[0].y);
      this.ctx.lineTo(pontos[1].x, pontos[1].y);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  private encontrarExtremidades(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const pontos = [];

    const bordas = [
      { x: 0, y: y0 + ((0 - x0) * (y1 - y0)) / (x1 - x0) }, // Esquerda
      { x: canvasWidth, y: y0 + ((canvasWidth - x0) * (y1 - y0)) / (x1 - x0) }, // Direita
      { x: x0 + ((0 - y0) * (x1 - x0)) / (y1 - y0), y: 0 }, // Topo
      { x: x0 + ((canvasHeight - y0) * (x1 - x0)) / (y1 - y0), y: canvasHeight }, // Fundo
    ];

    for (const ponto of bordas) {
      if (ponto.x >= 0 && ponto.x <= canvasWidth && ponto.y >= 0 && ponto.y <= canvasHeight) {
        pontos.push(ponto);
      }
    }
    return pontos.length === 2 ? pontos : [];
  }
}
