import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  image: string | null = null;

  private reader = new FileReader();

  constructor() {
    this.reader.onload = (event: any) => {
      this.image = event.target.result;
    };
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  handleFileInput(event: any): void {
    const files: FileList = event.target.files;
    if (!!files) {
      this.reader.readAsDataURL(files[0]);
    }
    // if (files.length > 0) {
    //   this.image = files[0];
    // }
  }
}
