import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IBreadcrumb } from './breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;

  constructor(
    private router: Router,
  ) {
    this.breadcrumbs = [];
  }

  public navigateBreadcrumb(breadcrumbData): void {
    this.router.navigate([breadcrumbData.url]);
  }
}
