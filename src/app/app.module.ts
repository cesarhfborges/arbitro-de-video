import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgIconsModule} from '@ng-icons/core';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';
import {ToastrModule} from 'ngx-toastr';
import {
  heroBackward,
  heroCheck,
  heroEye,
  heroEyeSlash,
  heroForward,
  heroMinus,
  heroPlus,
  heroTrash,
  heroXMark,
  heroPlay,
  heroPause,
  heroChevronLeft,
  heroChevronRight,
  heroChevronDoubleLeft,
  heroChevronDoubleRight,
  heroPaperAirplane
} from '@ng-icons/heroicons/outline';
import {BsModalService, ModalModule} from 'ngx-bootstrap/modal';
import {AppRoutingModule} from './app-routing.module';

// NG Translate
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {AppComponent} from './app.component';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ModalModule,
    ToastrModule.forRoot({
      autoDismiss: true,
      maxOpened: 1,
      newestOnTop: true,
      timeOut: 3000
    }),
    NgIconsModule.withIcons({
      heroTrash,
      heroPlus,
      heroMinus,
      heroXMark,
      heroCheck,
      heroEye,
      heroEyeSlash,
      heroBackward,
      heroForward,
      heroPlay,
      heroPause,
      heroChevronLeft,
      heroChevronRight,
      heroChevronDoubleLeft,
      heroChevronDoubleRight,
      heroPaperAirplane
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [BsModalService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
