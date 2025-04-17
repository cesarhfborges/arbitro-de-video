import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';

import {ModalVideoComponent, PageNotFoundComponent, VideoPlayerComponent} from './components/';
import {
  BlockMobileDirective,
  EventZoomDirective,
  ImageControlsDirective,
  ImageZoomDirective,
  WebviewDirective
} from './directives/';
import {ImageAnalisysComponent} from './components/image-analisys/image-analisys.component';
import {ContextService} from './services/context.service';
import {NgIconComponent} from '@ng-icons/core';

const COMPONENTS = [
  PageNotFoundComponent,
  ImageAnalisysComponent,
  VideoPlayerComponent,
  ModalVideoComponent
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
  imports: [CommonModule, TranslateModule, FormsModule, NgIconComponent],
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
export class SharedModule {
}
