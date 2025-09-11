import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiYearLineChartComponent } from './multi-year-line-chart.component';

describe('MultiYearLineChartComponent', () => {
  let component: MultiYearLineChartComponent;
  let fixture: ComponentFixture<MultiYearLineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiYearLineChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiYearLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
