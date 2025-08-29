import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphCandidatsComponent } from './graph-candidats.component';

describe('GraphCandidatsComponent', () => {
  let component: GraphCandidatsComponent;
  let fixture: ComponentFixture<GraphCandidatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphCandidatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphCandidatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
