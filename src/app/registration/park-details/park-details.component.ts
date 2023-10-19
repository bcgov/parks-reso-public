import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/shared/services/config.service';

@Component({
  selector: 'app-park-details',
  templateUrl: './park-details.component.html',
  styleUrls: ['./park-details.component.scss']
})
export class ParkDetailsComponent implements OnInit {
  @Input() park;
  public altText = 'Park Image';
  public url = '';
  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    if (this.park) {
      this.altText = this.park.name + ' Image';
      let altUrl = `${this.configService.config['ASSETS_S3_URL']}/images/${this.park.sk}/alt.webp`;

      this.checkIfImageExists(altUrl, exists => {
        if (exists) {
          this.url = altUrl;
        } else {
          this.url = `${this.configService.config['ASSETS_S3_URL']}/images/${this.park.sk}/card.webp`;
        }
      });
    }
  }

  checkIfImageExists(url, callback) {
    const img = new Image();
    img.src = url;

    if (img.complete) {
      callback(true);
    } else {
      img.onload = () => {
        callback(true);
      };

      img.onerror = () => {
        callback(false);
      };
    }
  }

  openMap(): void {
    if (this.park?.mapLink) {
      window.open(this.park.mapLink);
    }
  }
  openVideo(): void {
    if (this.park?.videoLink) {
      window.open(this.park.videoLink);
    }
  }
}
