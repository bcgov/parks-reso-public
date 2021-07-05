import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../services/config.service';

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
  public url = '';

  constructor(
    private router: Router,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    if (this.data?.name) {
      this.altText = this.data.name + ' Image';
    }
    this.url = this.configService.config['ASSETS_S3_URL'];
    this.url += `/${this.data.sk}/card.jpg`;
  }

  navigate(park): void {
    this.router.navigate(['registration'], { state: { park } });
  }
}
