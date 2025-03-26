import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-image-analisys',
  templateUrl: './image-analisys.component.html',
  styleUrls: ['./image-analisys.component.scss']
})
export class ImageAnalisysComponent implements OnInit {

  @Input() image: string;

  zoom: number = 100;
  scrollX: number = 0;
  scrollY: number = 0;

  constructor() { }

  ngOnInit(): void {
    // console.log(this.image);
  }

}
