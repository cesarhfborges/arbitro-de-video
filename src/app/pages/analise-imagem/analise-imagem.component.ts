import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analise-imagem',
  templateUrl: './analise-imagem.component.html',
  styleUrls: ['./analise-imagem.component.scss']
})
export class AnaliseImagemComponent implements OnInit {

  previews: number[] = Array.from({length: 4}).map((_, i) => i);

  value = {
    previews: 0
  };

  image: string;

  reader = new FileReader();

  constructor() {
    this.reader.onload = (event: any) => {
      this.image = event.target.result;
    };
  }

  ngOnInit(): void {
  }

  handleFileInput(file: FileList) {
    const item = file.item(0);

    //Show image preview
    // let reader = new FileReader();
    // reader.onload = (event: any) => {
    //   this.imageUrl = event.target.result;
    // }
    this.reader.readAsDataURL(item);
  }
}
