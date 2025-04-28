import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(
		public route: ActivatedRoute,
		public router: Router,
  ){}

  ngOnInit(): void {
    console.log('AppComponent initialisé');
  }

  title = 'tableauDeBord';
}
