import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskGeminiComponent } from './ask-gemini.component';

describe('AskGeminiComponent', () => {
  let component: AskGeminiComponent;
  let fixture: ComponentFixture<AskGeminiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskGeminiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskGeminiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
