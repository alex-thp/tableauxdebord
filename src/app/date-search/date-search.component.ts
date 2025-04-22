import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-date-search',
  templateUrl: './date-search.component.html',
  imports: [],
  styleUrls: ['./date-search.component.css']
  })
  export class DateSearchComponent implements OnInit {
  dateForm!: FormGroup;
  @Output() searchDates = new EventEmitter<{ startDate: string; endDate: string }>();
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
  this.dateForm = this.fb.group({
  startDate: [null, Validators.required],
  endDate: [null, Validators.required]
  });
  }
  
  onSubmit(): void {
  if (this.dateForm.valid) {
  const { startDate, endDate } = this.dateForm.value;
  this.searchDates.emit({ startDate, endDate });
  } else {
  this.dateForm.markAllAsTouched();
  }
  }
  }