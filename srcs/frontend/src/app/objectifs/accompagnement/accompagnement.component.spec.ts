import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccompagnementComponent } from './accompagnement.component';

describe('AccompagnementComponent', () => {
  let component: AccompagnementComponent;
  let fixture: ComponentFixture<AccompagnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccompagnementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccompagnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
