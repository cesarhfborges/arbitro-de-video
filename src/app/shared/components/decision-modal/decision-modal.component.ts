import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ContextService } from '../../services/context.service';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-decision-modal',
  templateUrl: './decision-modal.component.html',
  styleUrls: ['./decision-modal.component.scss']
})
export class DecisionModalComponent implements OnInit, OnDestroy {
  step: 1 | 2 = 1;
  decision: 'offside' | 'clean' | null = null;
  capturedImageObjUrl: string | null = null;
  safeImageUrl: SafeUrl | null = null;
  private capturedBlob: Blob | null = null;
  private sub: Subscription = new Subscription();

  constructor(
    public bsModalRef: BsModalRef,
    private contextService: ContextService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.contextService.frameCapturedEvent().subscribe(blob => {
        if (blob && this.step === 1 && this.decision !== null) {
          this.capturedBlob = blob;
          this.capturedImageObjUrl = URL.createObjectURL(blob);
          this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(this.capturedImageObjUrl);
          this.step = 2; // Avança para o passo 2
          this.cdr.detectChanges(); // Força atualização da view
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.capturedImageObjUrl) {
      URL.revokeObjectURL(this.capturedImageObjUrl);
    }
  }

  setDecision(verdict: 'offside' | 'clean'): void {
    this.decision = verdict;
    // Solicita a imagem para o HomeComponent
    this.contextService.requestFrame();
  }

  downloadDecision(): void {
    if (this.capturedBlob) {
      const type = this.decision === 'offside' ? 'impedimento' : 'lance-limpo';
      saveAs(this.capturedBlob, `var-decisao-${type}-${new Date().getTime()}.png`);
    }
  }

  close(): void {
    this.bsModalRef.hide();
  }
}
