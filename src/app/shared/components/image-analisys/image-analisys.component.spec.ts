import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAnalisysComponent } from './image-analisys.component';

describe('ImageAnalisysComponent', () => {
  let component: ImageAnalisysComponent;
  let fixture: ComponentFixture<ImageAnalisysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageAnalisysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageAnalisysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
