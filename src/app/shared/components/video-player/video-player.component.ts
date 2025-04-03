import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import videojs from 'video.js';

require('videojs-youtube');

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {

  @ViewChild('target', {static: true}) target!: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar', {static: false}) progressBar: ElementRef<HTMLInputElement>;
  @Output() selectedImageEvent = new EventEmitter<string>();
  @Input() src!: string;
  @Input() width?: number;
  @Input() height?: number;
  @Input() poster?: string;
  @Input() fluid: boolean = false;
  @Input() pip: boolean = false;
  @Input() muted: boolean = false;
  public rate: number = 1;
  protected playbackRates: number[] = [.1, .2, .3, .4, 0.5, 1, 1.5, 2];
  private player: any;
  private playing = false;
  private seekTime: number = .02;

  constructor() {
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  // get currentFrame(): string | null {
  //   if (!this.player || !this.target) {
  //     return null;
  //   }
  //
  //   const videoElement = this.target.nativeElement;
  //   const canvas = document.createElement('canvas');
  //   canvas.width = videoElement.videoWidth;
  //   canvas.height = videoElement.videoHeight;
  //
  //   const ctx = canvas.getContext('2d');
  //   if (ctx) {
  //     ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  //     return canvas.toDataURL('image/png'); // Você pode mudar para 'image/jpeg' se preferir
  //   }
  //   return null;
  // }
  // async captureFrame(): Promise<string | null> {
  //   try {
  //     // Solicita permissão para capturar a tela
  //     const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  //     const videoTrack = stream.getVideoTracks()[0];
  //
  //     // Cria um elemento de vídeo temporário para exibir o stream capturado
  //     const video = document.createElement('video');
  //     video.srcObject = new MediaStream([videoTrack]);
  //     await new Promise(resolve => (video.onloadedmetadata = resolve));
  //     await video.play();
  //
  //     // Aguarda um pequeno tempo para garantir que o vídeo está sendo renderizado
  //     await new Promise(resolve => setTimeout(resolve, 100));
  //
  //     // Captura o frame do vídeo
  //     const canvas = document.createElement('canvas');
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     const ctx = canvas.getContext('2d');
  //
  //     if (ctx) {
  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       videoTrack.stop(); // Para a captura da tela
  //       return canvas.toDataURL('image/png'); // Retorna a imagem capturada
  //     }
  //   } catch (error) {
  //     console.error('Erro ao capturar frame:', error);
  //   }
  //   return null;
  // }

  captureFrame(): string | null {
    const video = this.target.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png'); // Pega a imagem em base64
    }
    return null;
  }

  traitVideoSource(src: string): any {
    const httpRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;
    if (httpRegex.test(src)) {
      return {
        src,
        type: 'video/youtube',
      };
    }
    return {
      src: this.src
      // type: 'video/youtube',
      // src: 'https://www.youtube.com/watch?v=tnTalU8ckpc',
    };
  }

  ngOnInit(): void {
    this.player = videojs(this.target.nativeElement, {
      // techOrder: ['youtube'],
      sources: [
        // this.traitVideoSource(this.src)
        {
          src: this.src
        // type: 'video/youtube',
        // src: 'https://www.youtube.com/watch?v=tnTalU8ckpc',
        }
      ],
      width: this.width,
      height: this.height,
      // muted: this.muted,
      controlBar: false,
      // controlBar: {
      //   pictureInPictureToggle: this.pip,
      //   timeDivider: true,
      //   progressControl: {
      //     seekBar: true
      //   }
      // },
      preload: 'auto',
      notSupportedMessage: 'Conteúdo ou sistema incompatível.',
      playbackRates: this.playbackRates,
      noUITitleAttributes: true,
      responsive: true,
      suppressNotSupportedError: false,
      fullscreen: false,
      youtube: {
        ytControls: 0,
        // rel:0,
        // fs:0,
        // modestbranding: 1,
        modestbranding: 1, // Remove o logo do YouTube
        rel: 0, // Evita vídeos recomendados no final
        showinfo: 0, // (Obsoleto, mas incluído para compatibilidade)
        controls: 0, // Remove os controles nativos do YouTube
        fs: 0, // Remove o botão de tela cheia
        disablekb: 1 // Desativa atalhos de teclado
        // aspectRatio: "16:9"
      },
      // poster: this.poster,
      // fluid: this.fluid,
    }, this.onPlayerReady.bind(this));
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }

  save(): void {
    const imageData = this.captureFrame();
    if (imageData) {
      this.selectedImageEvent.emit(imageData);
    } else {
      console.warn('Não foi possível capturar o frame.');
    }
  }

  forward(value: number = 1) {
    if (!this.player.paused()) {
      this.player.pause();
    }
    const currentTime = this.player.currentTime();
    this.player.currentTime(currentTime + (this.seekTime * value));
  }

  rewind(value: number = 1) {
    if (!this.player.paused()) {
      this.player.pause();
    }
    const currentTime = this.player.currentTime();
    this.player.currentTime(currentTime - (this.seekTime * value));
  }

  togglePlay() {
    if (this.player.paused()) {
      this.player.play();
      this.playing = true;
    } else {
      this.player.pause();
      this.playing = false;
    }
  }

  onPlaybackRateChange(event: Event) {
    const selectedRate = parseFloat((event.target as HTMLSelectElement).value);
    this.player.playbackRate(selectedRate);
  }

  onRangeInput(event: Event) {
    if (this.player) {
      if (!this.player.paused()) {
        this.player.pause();
        this.playing = false;
      }
      const target = event.target as HTMLInputElement;
      const percentage = parseFloat(target.value);
      const newTime = this.player.duration() * (percentage / 100);
      this.player.currentTime(newTime);
    }
  }

  private onPlayerReady(): void {
    // console.log('Video Player ready!');
    // eslint-disable-next-line no-underscore-dangle
    this.player.tech_.off('dblclick');
    this.player.on('play', this.onPlay.bind(this));
    this.player.on('pause', this.onPause.bind(this));
    this.player.on('timeupdate', this.onTimeUpdate.bind(this));
  }

  private onPlay(): void {
    this.playing = true;
    // console.log('play');
  }

  private onPause(): void {
    this.playing = false;
    // console.log('pause');
  }

  private onTimeUpdate(event: any) {
    this.updateRangeValue();
    requestAnimationFrame(this.updateRangeValue.bind(this));
    // console.log('previous: ' + previousTime + ' current:' + this.player.currentTime());
    // console.log(' current:' + this.player.currentTime());
    // console.log(' teste: ', this.player.currentTime(this.player.currentTime() + 1/30));
    // console.log(' teste: ', this.player.currentTime());
    // this.previousTime = this.player.currentTime();
  }

  private updateRangeValue() {
    if (this.player && this.progressBar) {
      const currentTime = this.player.currentTime();
      const duration = this.player.duration();
      const percentage = duration ? (currentTime / duration) * 100 : 0;
      this.progressBar.nativeElement.value = percentage.toString();
    }
  }

  // private captureVideo(): string {
  //   const imageData = this.currentFrame;
  //   if (imageData) {
  //     const link = document.createElement('a');
  //     link.href = imageData;
  //     link.download = 'frame.png'; // Nome do arquivo para download
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } else {
  //     console.warn('Não foi possível capturar o frame.');
  //   }
  // }
}
