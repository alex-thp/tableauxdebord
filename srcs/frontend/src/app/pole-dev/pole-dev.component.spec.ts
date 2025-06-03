import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleDevComponent } from './pole-dev.component';

describe('PoleDevComponentComponent', () => {
  let component: PoleDevComponent;
  let fixture: ComponentFixture<PoleDevComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleDevComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoleDevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
