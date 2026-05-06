import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../shared/services/config.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  public envName: string = '';
  public showBanner = true;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.envName = this.configService.config['ENVIRONMENT'];
    if (this.envName === 'prod') {
      this.showBanner = false;
    }
  }

  skipToMainContent(event: Event): void {
    event.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Find first focusable element inside main-content
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const firstFocusable = mainContent.querySelector(focusableSelectors) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
        firstFocusable.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback to main-content if no focusable elements
        mainContent.focus();
      }
    }
  }
}
