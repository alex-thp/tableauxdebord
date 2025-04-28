import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalViewComponent } from './global-view.component';

describe('GlobalViewComponent', () => {
  let component: GlobalViewComponent;
  let fixture: ComponentFixture<GlobalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
