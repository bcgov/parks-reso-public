import { Component, EventEmitter, Input } from '@angular/core';
import {CardObject} from './card-object';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

/**
 * Main class that should contain all information needed to render a card.
 */
export class CardComponent  {
  @Input() data: CardObject;

  constructor() {
  }
}
