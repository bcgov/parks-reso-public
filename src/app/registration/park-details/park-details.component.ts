import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-park-details',
  templateUrl: './park-details.component.html',
  styleUrls: ['./park-details.component.scss']
})
export class ParkDetailsComponent implements OnInit {
  @Input() park;
  public altText = 'Park Image';
  public url = '';
  constructor(private configService: ConfigService) { }

  ngOnInit(): void {
    if (this.park) {
      this.altText = this.park.name + ' Image';
      this.url = this.configService.config['ASSETS_S3_URL'];
      this.url += `/images/${this.park.sk}/card.jpg`;
    }
  }

}
