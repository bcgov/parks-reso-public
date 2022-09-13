import { Component } from '@angular/core';
import { ConfigService } from '../shared/services/config.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public hashVersion: string;
  constructor(private configService: ConfigService) {
    this.hashVersion = this.configService.config.hashVersion;
  }
}
