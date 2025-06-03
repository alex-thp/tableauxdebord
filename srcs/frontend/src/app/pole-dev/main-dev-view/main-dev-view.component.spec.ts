import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDevViewComponent } from './main-dev-view.component';

describe('MainDevViewComponent', () => {
  let component: MainDevViewComponent;
  let fixture: ComponentFixture<MainDevViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainDevViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainDevViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
