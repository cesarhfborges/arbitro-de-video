import {Component, OnInit} from '@angular/core';
import {ContextService} from '../shared/services/context.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(
    private contextService: ContextService
  ) {
  }

  get showClose(): Observable<boolean> {
    return this.contextService.imageSelected();
  }

  ngOnInit(): void {
  }

  closeImage(): void {
    this.contextService.imageSelect(false);
  }

  exportImage(): void {
    this.contextService.exportImage();
  }
}
