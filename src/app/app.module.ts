import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgIconsModule } from '@ng-icons/core';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
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
    heroPaperAirplane,
    heroArrowDownTray,
    heroPresentationChartLine
} from '@ng-icons/heroicons/outline';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule,
        SharedModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ModalModule.forRoot(),
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
            heroPaperAirplane,
            heroArrowDownTray,
            heroPresentationChartLine
        }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: TranslateHttpLoader
            }
        })],
    providers: [
        provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule {
}
