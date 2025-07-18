import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyComparisonComponent } from './monthly-comparison.component';

describe('MonthlyComparisonComponent', () => {
  let component: MonthlyComparisonComponent;
  let fixture: ComponentFixture<MonthlyComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
