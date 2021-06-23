import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IBreadcrumb } from './breadcrumb/breadcrumb.component';
import { ToastService } from './services/toast.service';
import { Constants } from './shared/utils/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;
  toastSubscription: Subscription;


  constructor(
    private router: Router,
    private toastr: ToastrService,
    private toastService: ToastService
  ) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    this.watchForToast();
  }

  private watchForToast() {
    // tslint:disable-next-statement
    const self = this;
    this.toastSubscription = this.toastService.messages.subscribe(messages => {
      messages.forEach(msg => {
        switch (msg.type) {
          case Constants.ToastTypes.SUCCESS:
            this.toastr.success(
              msg.body,
              msg.title
            );
            break;
          case Constants.ToastTypes.WARNING:
            this.toastr.warning(
              msg.body,
              msg.title
            );
            break;
          case Constants.ToastTypes.INFO:
            this.toastr.info(
              msg.body,
              msg.title
            );
            break;
          case Constants.ToastTypes.ERROR:
            this.toastr.error(
              msg.body,
              msg.title,
              {
                extendedTimeOut: 0,
                timeOut: 0,
                closeButton: true
              });
            break;
        }
        // Remove message from memory
        self.toastService.removeMessage(msg.guid);
      });
    });
  }

  public navigateBreadcrumb(breadcrumbData): void {
    this.router.navigate([breadcrumbData.url]);
  }
}
