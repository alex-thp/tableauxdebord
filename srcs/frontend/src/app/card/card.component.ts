import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import * as featherIcons from '@ng-icons/feather-icons';
import { ActivatedRoute, Router } from '@angular/router';
import { CardData } from '../models/data.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  viewProviders: [provideIcons(featherIcons)],
})
export class CardComponent implements OnChanges {
  @Input() data!: CardData;
  i: number = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      console.log('Data mise à jour dans CardComponent:', this.data);
      switch (this.data.label) {
        case 'Pôle Accompagnement':
          this.i = 1;
          break;
        case 'Pôle Bénévole':
          this.i = 2;
          break;
        case 'Pôle Parcours Cravate':
          this.i = 3;
          break;
      }
    }
  }

  toggleFullScreen(): void {
    console.log(this.i);
    this.router.navigate(['/view', `${this.i}`]).then(
      (nav) => {
        console.log(nav); // true if navigation is successful
      },
      (err) => {
        console.log(err); // when there's an error
      }
    );
  }
}
