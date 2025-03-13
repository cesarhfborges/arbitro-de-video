import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnaliseImagemComponent } from './analise-imagem.component';

describe('AnaliseImagemComponent', () => {
  let component: AnaliseImagemComponent;
  let fixture: ComponentFixture<AnaliseImagemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnaliseImagemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnaliseImagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
