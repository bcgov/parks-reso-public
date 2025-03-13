import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../shared/services/config.service';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: false
})

/**
 * Main class that should contain all information needed to render a card.
 */
export class CardComponent implements OnInit {
  @Input() data: any;
  public altText = 'Park Image';
  public url = '';
  public specialClosureText = '';

  constructor(
    private router: Router,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    if (this.data) {
      this.altText = this.data.name + ' Image';
      this.url = this.configService.config['ASSETS_S3_URL'];
      this.url += `/images/${this.data.sk}/card.webp`;
      if (this.data.specialClosureText){
        this.specialClosureText = this.data.specialClosureText;
      }
    }
    
  }

  navigate(park): void {
    this.router.navigate(['registration'], { state: { park } }); 
  }
}
