import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

import { ModalVideoComponent, PageNotFoundComponent, VideoPlayerComponent } from './components/';
import {
  BlockMobileDirective,
  EventZoomDirective,
  ImageControlsDirective,
  ImageZoomDirective,
  WebviewDirective
} from './directives/';
import { ImageAnalisysComponent } from './components/image-analisys/image-analisys.component';
import { DecisionModalComponent } from './components/decision-modal/decision-modal.component';
import { ContextService } from './services/context.service';
import { NgIconComponent, NgIconsModule } from '@ng-icons/core';
import { heroHandThumbUp, heroHandThumbDown, heroCheck, heroXMark, heroArrowDownTray } from '@ng-icons/heroicons/outline';

const COMPONENTS = [
  PageNotFoundComponent,
  ImageAnalisysComponent,
  VideoPlayerComponent,
  ModalVideoComponent,
  DecisionModalComponent
];

const DIRECTIVES = [
  WebviewDirective,
  ImageControlsDirective,
  EventZoomDirective,
  ImageZoomDirective,
  BlockMobileDirective
];


@NgModule({
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    NgIconComponent,
    NgIconsModule.withIcons({ heroHandThumbUp, heroHandThumbDown, heroCheck, heroXMark, heroArrowDownTray })
  ],
  exports: [
    TranslateModule,
    FormsModule,
    ...COMPONENTS,
    ...DIRECTIVES,
  ]
})
export class SharedModule {
}
