import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective, ImageControlsDirective } from './directives/';
import { ImageAnalisysComponent } from './components/image-analisys/image-analisys.component';
import { OffsideAnalysisDirective } from './directives/offside-analisys/offside-analysis.directive';

const COMPONENTS = [
  PageNotFoundComponent,
  ImageAnalisysComponent
];

const DIRECTIVES = [
  WebviewDirective,
  ImageControlsDirective,
  OffsideAnalysisDirective
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
  ]
})
export class SharedModule {}
