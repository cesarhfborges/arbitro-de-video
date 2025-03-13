import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';

import {PagesRoutingModule} from './pages-routing.module';
import {HomeComponent} from './home/home.component';
import {LayoutComponent} from './layout.component';
import {AnaliseImagemComponent} from './analise-imagem/analise-imagem.component';


@NgModule({
  declarations: [
    HomeComponent,
    LayoutComponent,
    AnaliseImagemComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    NgOptimizedImage,
    CoreModule,
    SharedModule
  ]
})
export class PagesModule {
}
