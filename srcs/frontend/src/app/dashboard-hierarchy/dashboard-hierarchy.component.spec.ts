import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardHierarchyComponent } from './dashboard-hierarchy.component';

describe('DashboardHierarchyComponent', () => {
  let component: DashboardHierarchyComponent;
  let fixture: ComponentFixture<DashboardHierarchyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHierarchyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
