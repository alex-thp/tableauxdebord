import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import * as featherIcons from '@ng-icons/feather-icons';

@Component({
  selector: 'app-pole-dev',
  imports: [CommonModule, NgIcon],
  templateUrl: './pole-dev.component.html',
  styleUrl: './pole-dev.component.css',
  viewProviders: [provideIcons(featherIcons)]
})
export class PoleDevComponent {
  constructor(private route: ActivatedRoute, private router: Router) {}

  toggleFullScreen(): void {
    this.router.navigate(['/dev']).then(nav => {
      console.log(nav); // true if navigation is successful
    }, err => {
      console.log(err) // when there's an error
    });
  }
}
