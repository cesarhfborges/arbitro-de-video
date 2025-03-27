import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  image: string | null = null;

  configs: any = {
    file: {
      accept: 'image/*, video/*',
    }
  };

  options: any = {
    imageY: 50,
    imageX: 50,
    imageZ: 80,
    imageInvertColor: false,
    grayscale: false,
    sepia: false,
  };

  private reader = new FileReader();

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDragging = false;
  private selectedHandle: number | null = null;
  private vertices = [
    { x: 50, y: 50 },  // Top-left
    { x: 150, y: 50 }, // Top-right
    { x: 150, y: 150 }, // Bottom-right
    { x: 50, y: 150 }  // Bottom-left
  ];
  private handleSize = 10;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.reader.onload = (event: any) => {
      this.image = event.target.result;
    };
    this.reader.onloadend = (event: any) => {
      this.createCanvas();
    };
  }

  get imageSizes(): { width: number; height: number } {
    const el: HTMLDivElement = this.el.nativeElement.querySelector('#element');
    // console.log(el.clientWidth);
    return {width: el.clientWidth, height: el.clientHeight};
  }

  get imageTop(): string {
    const {height} = this.imageSizes;
    return `calc(${this.options.imageY}% - ${Math.round(height / 2)}px)`;
  }

  get imageLeft(): string {
    const {width} = this.imageSizes;
    return `calc(${this.options.imageX}% - ${Math.round(width / 2)}px)`;
  }

  get imageZoom(): number {
    return this.options.imageZ;
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
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

  createCanvas(): void {
    const el: HTMLDivElement = this.el.nativeElement.querySelector('#element');
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.appendChild(el, this.canvas);
    this.renderer.setStyle(this.canvas, 'position', 'absolute');
    this.renderer.setStyle(this.canvas, 'background', 'rgba(0,0,0,.7)');
    this.renderer.setStyle(this.canvas, 'width', '100%');
    this.renderer.setStyle(this.canvas, 'height', '100%');
    this.renderer.setStyle(this.canvas, 'top', 0);
    this.renderer.setStyle(this.canvas, 'left', 0);
    this.canvas.width = el.clientWidth;
    this.canvas.height = el.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.updateCanvas();

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  updateCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 1;

    // Desenha o polígono corretamente
    this.ctx.beginPath();
    this.ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    this.ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
    this.ctx.lineTo(this.vertices[2].x, this.vertices[2].y);
    this.ctx.lineTo(this.vertices[3].x, this.vertices[3].y);
    this.ctx.closePath();
    this.ctx.stroke();

    // Desenha os pontos de controle como círculos
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = 'transparent';
    this.vertices.forEach(vertex => {
      this.ctx.beginPath();
      this.ctx.arc(vertex.x, vertex.y, this.handleSize / 2, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    });
  }

  onMouseDown(event: MouseEvent): void {
    const {offsetX, offsetY} = event;

    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      const dx = offsetX - vertex.x;
      const dy = offsetY - vertex.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.handleSize / 2) {
        this.isDragging = true;
        this.selectedHandle = i;
        return;
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.selectedHandle === null) {return;}
    const {offsetX, offsetY} = event;
    this.vertices[this.selectedHandle] = {x: offsetX, y: offsetY};
    this.updateCanvas();
  }

  onMouseUp(): void {
    this.isDragging = false;
    this.selectedHandle = null;
  }

  // createCanvas(): void {
  //   const el: HTMLDivElement = this.el.nativeElement.querySelector('#element');
  //   this.canvas = this.renderer.createElement('canvas');
  //   this.renderer.appendChild(el, this.canvas);
  //   // this.renderer.setAttribute(this.canvas, 'class', 'canvas');
  //   this.renderer.setStyle(this.canvas, 'position', 'absolute');
  //   this.renderer.setStyle(this.canvas, 'background', 'rgba(0,0,0,.7)');
  //   this.renderer.setStyle(this.canvas, 'width', '100%');
  //   this.renderer.setStyle(this.canvas, 'height', '100%');
  //   this.renderer.setStyle(this.canvas, 'top', 0);
  //   this.renderer.setStyle(this.canvas, 'left', 0);
  //
  //   this.ctx = this.canvas.getContext('2d');
  //
  //   this.ctx.beginPath();
  //   this.ctx.rect(20, 40, 50, 50);
  //   this.ctx.stroke();
  //   // this.ctx.fillStyle = '#FF0000';
  //   // this.ctx.fill();
  //   this.ctx.closePath();
  // }
}
