import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../shared/services/config.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  public envName: string;
  public showBanner = true;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.envName = this.configService.config['ENVIRONMENT'];
    if (this.envName === 'prod') {
      this.showBanner = false;
    }
  }
}
