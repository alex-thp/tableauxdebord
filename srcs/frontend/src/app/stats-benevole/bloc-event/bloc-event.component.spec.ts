import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocEventComponent } from './bloc-event.component';

describe('BlocEventComponent', () => {
  let component: BlocEventComponent;
  let fixture: ComponentFixture<BlocEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlocEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlocEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
