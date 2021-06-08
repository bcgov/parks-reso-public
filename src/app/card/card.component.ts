import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class CardComponent implements OnInit {
  @Input() data: any;
  public altText = 'Park Image';

  constructor(private router: Router) { }

  ngOnInit() {
    if (this.data.name) {
      this.altText = this.data.name + ' Park Image';
    }
  }

  navigate(park): void {
    this.router.navigate(['registration'], { state: { park } });
  }
}
