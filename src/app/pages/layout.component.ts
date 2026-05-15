import {Component, OnInit} from '@angular/core';
import {ContextService} from '../shared/services/context.service';
import {Observable} from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DecisionModalComponent } from '../shared/components/decision-modal/decision-modal.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  bsModalRef?: BsModalRef;

  constructor(
    private contextService: ContextService,
    private modalService: BsModalService
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

  openDecisionModal(): void {
    this.bsModalRef = this.modalService.show(DecisionModalComponent, {
      class: 'modal-dialog-centered modal-lg',
      backdrop: 'static'
    });
  }
}
