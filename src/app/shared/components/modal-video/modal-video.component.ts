import { Component, OnInit } from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-video',
  templateUrl: './modal-video.component.html',
  styleUrls: ['./modal-video.component.scss']
})
export class ModalVideoComponent implements OnInit {
  src: string = '';

  onclose: (value: string) => void;

  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit(): void {
  }


  onSelectImage($event: string) {
    this.onclose($event);
  }
}
