import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleViewComponent } from './pole-view.component';

describe('PoleViewComponent', () => {
  let component: PoleViewComponent;
  let fixture: ComponentFixture<PoleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
