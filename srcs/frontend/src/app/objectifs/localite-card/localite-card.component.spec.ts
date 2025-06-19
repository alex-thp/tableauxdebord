import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocaliteCardComponent } from './localite-card.component';

describe('LocaliteCardComponent', () => {
  let component: LocaliteCardComponent;
  let fixture: ComponentFixture<LocaliteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocaliteCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocaliteCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
