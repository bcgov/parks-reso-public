import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { CardObject } from './card-object';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

/**
 * Main class that should contain all information needed to render a card.
 */
export class CardComponent {
  @Input() data: CardObject;

  constructor(private router: Router) { }

  navigate(park): void {
    this.router.navigate(['registration'], { state: { park } });
  }
}
