import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ContextService} from '../../shared/services/context.service';
import {ToastrService} from 'ngx-toastr';
import {fakerPT_BR} from '@faker-js/faker';
import {BsModalRef, BsModalService, ModalOptions} from 'ngx-bootstrap/modal';
import {ModalVideoComponent} from '../../shared/components';

interface IPosition {
  x: number;
  y: number;
}

type LineType = 'none' | 'area' | 'guides' | 'all';
type OffsideLineType = 'horizontal' | 'vertical' | 'all';

interface IOptions {
  imageY: number;
  imageX: number;
  imageZ: number;
  filtro: 'invert' | 'grayscale' | 'sepia' | 'none';
  magnifier: boolean;
  lines: LineType;
  offsideLineType: OffsideLineType;
  offside: number | null;
  verticalReference: boolean;
  offsideLineLen: number;
  offsideLineSpace: number;
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
  @ViewChild('inputShowRect') inputShowRect: ElementRef<HTMLInputElement>;
  @ViewChild('imageCanvas') imageCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('inputFile') inputFile!: ElementRef<HTMLInputElement>;
  @ViewChild('inputURL') inputURL!: ElementRef<HTMLInputElement>;

  image: HTMLImageElement | null = null;

  configs: any = {
    file: {
      accept: {
        imageTypes: ['.jpg', '.jpeg', '.png'], // 'image/jpeg',
        videoTypes: ['.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.mp4'], //'video/mp4',
      },
    }
  };

  options: IOptions = {
    imageY: 50,
    imageX: 50,
    imageZ: 80,
    filtro: 'none',
    magnifier: false,
    lines: 'all',
    offside: null,
    offsideLineType: 'all',
    verticalReference: true,
    offsideLineLen: .5,
    offsideLineSpace: 1
  };
  protected offsideLines: { x: number; y: number; color: string; visible: boolean }[] = [];
  private modalRef: BsModalRef;
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
    private renderer: Renderer2,
    private toastr: ToastrService,
    private modalService: BsModalService
  ) {
    this.reader.onload = (event: any) => {
      // this.image = event.target.result;
      this.image = new Image();
      this.image.onload = () => {
        const baseV = this.image.width / 4;
        const baseH = this.image.height / 4;
        this.vertices = {
          topLeft: {x: (this.image.width / 2) - baseV, y: (this.image.height / 2) - baseH},
          topRight: {x: (this.image.width / 2) + baseV, y: (this.image.height / 2) - baseH},
          bottomRight: {x: (this.image.width / 2) + baseV, y: (this.image.height / 2) + baseH},
          bottomLeft: {x: (this.image.width / 2) - baseV, y: (this.image.height / 2) + baseH}
          // topLeft: {x: 50, y: 50},
          // topRight: {x: 150, y: 50},
          // bottomRight: {x: 150, y: 150},
          // bottomLeft: {x: 50, y: 150}
        };
        this.createCanvas();
        // this.drawRectangle(ctx, img.width, img.height);
      };
      this.image.src = event.target.result;
      this.contextService.imageSelect(true);
    };
  }

  get acceptableFileTypes(): string[] {
    const {imageTypes, videoTypes} = this.configs.file.accept;
    return [...imageTypes, ...videoTypes];
  }

  get fileTypes(): string {
    return this.acceptableFileTypes.join(', ');
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

  openLink(): void {
    this.toastr.clear();
    const httpRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    if (httpRegex.test(this.inputURL.nativeElement.value)) {
      this.openModal(this.inputURL.nativeElement.value);
      this.inputURL.nativeElement.value = '';
    } else {
      this.toastr.error('Link inválido.', 'Ops...');
    }
  }

  openModal(url: string): void {
    const initialState: ModalOptions = {
      initialState: {
        src: url
      },
      class: 'modal-fullscreen',
      ignoreBackdropClick: true,
      animated: true
    };
    this.modalRef = this.modalService.show(ModalVideoComponent, initialState);
    this.modalRef.content.closeBtnName = 'Close';
    this.modalRef.content.onclose = (value: string) => {
      // Do something with myData and then hide
      this.modalRef.hide();
      this.onSelectImage(value);
    };
  }

  onSelectImage(event: string): void {
    this.image = new Image();
    this.image.onload = () => {
      const baseV = this.image.width / 4;
      const baseH = this.image.height / 4;
      this.vertices = {
        topLeft: {x: (this.image.width / 2) - baseV, y: (this.image.height / 2) - baseH},
        topRight: {x: (this.image.width / 2) + baseV, y: (this.image.height / 2) - baseH},
        bottomRight: {x: (this.image.width / 2) + baseV, y: (this.image.height / 2) + baseH},
        bottomLeft: {x: (this.image.width / 2) - baseV, y: (this.image.height / 2) + baseH}
        // topLeft: {x: 50, y: 50},
        // topRight: {x: 150, y: 50},
        // bottomRight: {x: 150, y: 150},
        // bottomLeft: {x: 50, y: 150}
      };
      this.createCanvas();
    };
    this.image.src = event;
    this.contextService.imageSelect(true);
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  ngOnInit(): void {
    this.contextService.imageSelected().subscribe({
      next: value => {
        if (!value) {
          this.image = null;
        }
      }
    });
  }

  handleFileInput(event: any): void {
    this.toastr.clear();
    const files: FileList = event.target.files;
    if (!!files && files.length === 1) {
      if (this.acceptableFileTypes.some(str => files[0].name.includes(str))) {
        this.reader.readAsDataURL(files[0]);
      } else {
        this.inputFile.nativeElement.value = '';
        this.toastr.error('Tipo de arquivo não suportado.', 'Ops...');
      }
    } else {
      this.inputFile.nativeElement.value = '';
      this.toastr.error('Selecione somente um arquivo.', 'Ops...');
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
    this.ctx.imageSmoothingEnabled = true;

    this.updateCanvas();

    this.imageCanvas.nativeElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.imageCanvas.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.imageCanvas.nativeElement.addEventListener('mouseup', this.onMouseUp.bind(this));
  }


  onMouseDown(event: MouseEvent): void {
    const {offsetX, offsetY} = event;
    this.isMouseDragging = true;
    for (const i of Object.keys(this.vertices)) {
      const vertex = this.vertices[i];
      const dx = offsetX - vertex.x;
      const dy = offsetY - vertex.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (['all', 'area'].includes(this.options.lines) && distance <= this.handleSize / 2) {
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
      } else if (this.options.offside !== null && ['all', 'guides'].includes(this.options.lines)) {
        this.renderer.setStyle(this.imageCanvas.nativeElement, 'cursor', 'none');
        const {offsetX, offsetY} = event;
        if (this.options.offside !== null) {
          this.offsideLines[this.options.offside].x = offsetX;
          this.offsideLines[this.options.offside].y = offsetY;
          this.updateCanvas();
        }
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
    if (['all', 'guides'].includes(this.options.lines)) {
      this.criarLinhaImpedimento();
    }
  }

  onChangeOptions(): void {
    setTimeout(() => {
      this.updateCanvas();
    }, 10);
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
    this.updateCanvas();
  }

  private updateCanvas(): void {
    if (!!this.ctx) {
      this.ctx.clearRect(0, 0, this.imageCanvas.nativeElement.width, this.imageCanvas.nativeElement.height);
      this.imageCanvas.nativeElement.width = this.image.width;
      this.imageCanvas.nativeElement.height = this.image.height;
      this.ctx.drawImage(this.image, 0, 0);
      switch (this.options.filtro) {
        case 'invert':
          this.inverterCores();
          break;
        case 'grayscale':
          this.aplicarFiltroCinza();
          break;
        case 'sepia':
          this.aplicarFiltroSepia();
          break;
      }
      if (['all', 'area'].includes(this.options.lines)) {
        this.criarArea();
      }
      if (['all', 'guides'].includes(this.options.lines)) {
        if (!this.isAreaDragging || this.selectedHandle === null) {
          this.criarLinhaImpedimento();
        }
      }
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
    // ** Captura os pontos do retângulo **
    const {topLeft, topRight, bottomLeft, bottomRight} = this.vertices;

    if (['all', 'vertical'].includes(this.options.offsideLineType)) {
      // ** Calcular o ponto de fuga (homografia) Vertical **
      const pontoDeFugaVertical = this.calcularPontoFugaVertical(topLeft, topRight, bottomLeft, bottomRight);
      this.desenharLinhaComPerspectiva(posX, posY, pontoDeFugaVertical, color); // Linha vertical
    }

    if (['all', 'horizontal'].includes(this.options.offsideLineType)) {
      // ** Calcular o ponto de fuga (homografia) Horizontal **
      const pontoDeFugaHorizontal = this.calcularPontoFugaHorizontal(topLeft, topRight, bottomLeft, bottomRight);
      this.desenharLinhaComPerspectiva(posX, posY, pontoDeFugaHorizontal, color); // Linha horizontal
    }

    if (this.options.verticalReference) {
      this.desenharLinhaReta(posX, posY, color);  // Linha vertical
    }
  }

  private invertColor(hex: string): string {
    // Garante que o HEX está no formato correto
    hex = hex.replace(/^#/, '');

    if (hex.length !== 6) {
      throw new Error('Formato de cor inválido. Use um HEX de 6 caracteres.');
    }

    // Converte HEX para RGB
    const r: number = 255 - parseInt(hex.substring(0, 2), 16);
    const g: number = 255 - parseInt(hex.substring(2, 4), 16);
    const b: number = 255 - parseInt(hex.substring(4, 6), 16);

    // Converte de volta para HEX
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }

  private desenharLinhaReta(
    x: number,
    y: number,
    color: string,
  ): void {
    this.ctx.strokeStyle = this.invertColor(color);
    this.ctx.lineWidth = this.options.offsideLineLen;

    this.ctx.beginPath();
    this.ctx.setLineDash([this.options.offsideLineSpace, this.options.offsideLineSpace]);
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private calcularPontoFugaHorizontal(
    topLeft: { x: number; y: number },
    topRight: { x: number; y: number },
    bottomLeft: { x: number; y: number },
    bottomRight: { x: number; y: number }
  ): { x: number; y: number } {
    const m1 = (bottomRight.y - bottomLeft.y) / (bottomRight.x - bottomLeft.x);
    const m2 = (topRight.y - topLeft.y) / (topRight.x - topLeft.x);

    const A = [
      [1, -1],
      [m1, -m2]
    ];
    const res = [[topLeft.x - bottomLeft.x], [topLeft.y - bottomLeft.y]];

    // eslint-disable-next-line
    const numeric = window['numeric'];
    const g = numeric.solve(A, res);

    return {
      x: bottomLeft.x + g[0],
      y: bottomLeft.y + g[0] * m1
    };
  }

  private calcularPontoFugaVertical(
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
  ): void {
    const pontos = this.encontrarExtremidades(x, y, pontoFuga.x, pontoFuga.y, this.ctx.canvas.width, this.ctx.canvas.height);

    if (pontos.length === 2) {
      this.ctx.beginPath();
      this.ctx.setLineDash([]);
      this.ctx.moveTo(pontos[0].x, pontos[0].y);
      this.ctx.lineTo(pontos[1].x, pontos[1].y);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = this.options.offsideLineLen;
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
      {x: 0, y: y0 + ((0 - x0) * (y1 - y0)) / (x1 - x0)}, // Esquerda
      {x: canvasWidth, y: y0 + ((canvasWidth - x0) * (y1 - y0)) / (x1 - x0)}, // Direita
      {x: x0 + ((0 - y0) * (x1 - x0)) / (y1 - y0), y: 0}, // Topo
      {x: x0 + ((canvasHeight - y0) * (x1 - x0)) / (y1 - y0), y: canvasHeight}, // Fundo
    ];

    for (const ponto of bordas) {
      if (ponto.x >= 0 && ponto.x <= canvasWidth && ponto.y >= 0 && ponto.y <= canvasHeight) {
        pontos.push(ponto);
      }
    }
    return pontos.length === 2 ? pontos : [];
  }

  private inverterCores(): void {
    const imageData = this.ctx.getImageData(0, 0, this.imageCanvas.nativeElement.width, this.imageCanvas.nativeElement.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];     // Vermelho
      data[i + 1] = 255 - data[i + 1]; // Verde
      data[i + 2] = 255 - data[i + 2]; // Azul
      // O quarto valor (data[i + 3]) é o canal alfa (transparência), geralmente não é invertido
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  private aplicarFiltroCinza(): void {
    const imageData = this.ctx.getImageData(0, 0, this.imageCanvas.nativeElement.width, this.imageCanvas.nativeElement.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const gray = 0.299 * red + 0.587 * green + 0.114 * blue;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  private aplicarFiltroSepia(): void {
    const imageData = this.ctx.getImageData(0, 0, this.imageCanvas.nativeElement.width, this.imageCanvas.nativeElement.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const newRed = Math.min(255, 0.393 * red + 0.769 * green + 0.189 * blue);
      const newGreen = Math.min(255, 0.349 * red + 0.686 * green + 0.168 * blue);
      const newBlue = Math.min(255, 0.272 * red + 0.534 * green + 0.131 * blue);
      data[i] = newRed;
      data[i + 1] = newGreen;
      data[i + 2] = newBlue;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
}
