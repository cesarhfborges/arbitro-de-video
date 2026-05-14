import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';

import {PagesRoutingModule} from './pages-routing.module';
import {HomeComponent} from './home/home.component';
import {LayoutComponent} from './layout.component';
import {ReactiveFormsModule} from '@angular/forms';
import { NgIconComponent, NgIconsModule } from '@ng-icons/core';
import { heroPlay, heroPause, heroArrowDownTray, heroChevronLeft, heroChevronRight, heroSpeakerXMark, heroSpeakerWave } from '@ng-icons/heroicons/outline';

@NgModule({
  declarations: [
    HomeComponent,
    LayoutComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    NgOptimizedImage,
    CoreModule,
    SharedModule,
    ReactiveFormsModule,
    NgIconComponent,
    NgIconsModule.withIcons({ heroPlay, heroPause, heroArrowDownTray, heroChevronLeft, heroChevronRight, heroSpeakerXMark, heroSpeakerWave }),
    PagesRoutingModule
  ]
})
export class PagesModule {
}
