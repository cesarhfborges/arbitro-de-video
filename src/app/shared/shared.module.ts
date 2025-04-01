import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective, ImageControlsDirective, EventZoomDirective, ImageZoomDirective } from './directives/';
import { ImageAnalisysComponent } from './components/image-analisys/image-analisys.component';
import {ContextService} from './services/context.service';

const COMPONENTS = [
  PageNotFoundComponent,
  ImageAnalisysComponent
];

const DIRECTIVES = [
  WebviewDirective,
  ImageControlsDirective,
  EventZoomDirective,
  ImageZoomDirective
];


@NgModule({
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  imports: [CommonModule, TranslateModule, FormsModule],
  exports: [
    TranslateModule,
    FormsModule,
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  providers: [
    ContextService
  ]
})
export class SharedModule {}
