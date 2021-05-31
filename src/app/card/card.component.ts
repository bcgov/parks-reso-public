import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

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
  @Output() messageOut: EventEmitter<any> = new EventEmitter<any>();


  constructor(private router: Router) {
  }

  navigate(id): void {
    this.router.navigate(['park', id]);
  }

  onMessageOut(msg): void {
    this.messageOut.emit(msg);
  }

}
