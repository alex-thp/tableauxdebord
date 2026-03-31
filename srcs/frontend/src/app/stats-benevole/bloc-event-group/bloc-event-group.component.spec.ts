import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocEventGroupComponent } from './bloc-event-group.component';

describe('BlocEventGroupComponent', () => {
  let component: BlocEventGroupComponent;
  let fixture: ComponentFixture<BlocEventGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlocEventGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlocEventGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
