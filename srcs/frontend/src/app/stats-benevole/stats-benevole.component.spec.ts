import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsBenevoleComponent } from './stats-benevole.component';

describe('StatsBenevoleComponent', () => {
  let component: StatsBenevoleComponent;
  let fixture: ComponentFixture<StatsBenevoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsBenevoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsBenevoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
