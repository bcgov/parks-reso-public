import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pass } from '../models/pass';
import { PassService } from '../services/pass.service';
import { ToastService } from '../services/toast.service';
import { AlertObject } from '../shared/components/alert/alert-object';
import { Constants } from '../shared/utils/constants';
import { PassLookupFormComponent } from './pass-lookup-form/pass-lookup-form.component';

@Component({
  selector: 'app-pass-lookup',
  templateUrl: './pass-lookup.component.html',
  styleUrls: ['./pass-lookup.component.scss']
})
export class PassLookupComponent implements OnInit {
  @Input() pass: Pass;
  @ViewChild(PassLookupFormComponent) form: PassLookupFormComponent;

  // states: loading, blank, verify-populate, not-verified, verified, not-cancelled, cancelled
  public state = 'loading';

  public verificationText = 'Yes, this is my reservation information';
  public title = 'Cancel a reservation';
  public backButtonText = 'Home';

  public validationData = '';

  public urlData = {
    passId: '',
    email: '',
    park: '',
    code: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private passService: PassService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.scrollToTop();
    this.checkUrlHeaders();
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


  checkUrlHeaders() {
    this.route.queryParams.subscribe(params => {
      for (let paramKey in params) {
        if (this.urlData.hasOwnProperty(paramKey)) {
          this.urlData[paramKey] = params[paramKey];
        }
      }
    });
    if (this.route.snapshot.queryParamMap.get('passId')) {
      if (this.urlData) {
        if (this.urlData.code && this.urlData.code !== '') {
          this.cancelReservation();
          return;
        } else {
          this.changeState('verify-populate');
          return;
        }
      }
    }
    this.changeState('blank');
  }

  passNotFound(): AlertObject {
    let alert = new AlertObject({
      type: 'error',
      title: 'Unable to find reservation',
      message: 'The system was unable to find this reservation. It may have already been cancelled, or it may have expired.',
      smallAlert: true
    });
    return alert;
  }

  passNotCancelled(): AlertObject {
    let alert = new AlertObject({
      type: 'error',
      title: 'Unable to cancel reservation',
      message: 'The system was unable to cancel this reservation. It may have already been cancelled, or it may have expired.',
      smallAlert: true
    });
    return alert;
  }

  passSuccessfullyCancelled(): AlertObject {
    let alert = new AlertObject({
      type: 'info',
      title: 'Successful reservation cancel',
      message: 'Your reservation has been successfully cancelled',
      smallAlert: true
    });
    return alert;
  }

  passSuccessfullyVerified(): AlertObject {
    let alert = new AlertObject({
      type: 'info',
      title: 'Please check your email',
      message: 'A cancellation email has been sent to the address associated with this pass. Please check your inbox.',
      smallAlert: true
    });
    return alert;
  }

  async validateInfo() {
    if (this.urlData) {
      let res = null;
      try {
        this.changeState('loading');
        res = await this.passService.getPassToCancel(this.urlData);
      } catch (e) {
        this.changeState('not-verified');
        return;
      }
      if (res) {
        this.changeState('verified');
        this.validationData = res;
        return;
      }
      this.changeState('not-verified');
    }
  }

  async cancelReservation() {
    let res = null;
    this.changeState('loading');
    try {
      res = await this.passService.cancelPass(this.urlData);
    } catch (e) {
      this.changeState('not-cancelled');
      return;
    }
    if (res) {
      this.changeState('cancelled');
      return;
    }
    this.changeState('not-cancelled');
  }

  navigate(): void {
    this.resetPage();
    this.router.navigate(['']);
  }

  resetPage(): void {
    if (this.form) {
      this.form.resetForm();
    }
    this.urlData.passId = '';
    this.urlData.email = '';
    this.urlData.code = '';
    this.urlData.park = '';
  }

  changeState(state): void {
    this.scrollToTop();
    switch (state) {
      case 'loading':
        this.state = 'loading';
        break;
      case 'blank':
        this.resetPage();
        this.state = 'blank';
        break;
      case 'verify-populate':
        this.state = 'verify-populate';
        break;
      case 'not-verified':
        this.state = 'not-verified';
        // tslint:disable-next-line:max-line-length
        this.toastService.addMessage(`The system was unable to find this reservation. It may have already been cancelled, or it may have expired.`, `Not found`, Constants.ToastTypes.ERROR);
        break;
      case 'verified':
        this.state = 'verified';
        this.resetPage();
        // tslint:disable-next-line:max-line-length
        this.toastService.addMessage(`A verification email has been sent. Please check your inbox.`, `Email sent`, Constants.ToastTypes.INFO);
        break;
      case 'not-cancelled':
        this.state = 'not-cancelled';
        // tslint:disable-next-line:max-line-length
        this.toastService.addMessage(`The system was unable to cancel this reservation. It may have already been cancelled, or it may have expired.`, `Not cancelled`, Constants.ToastTypes.ERROR);
        break;
      case 'cancelled':
        this.resetPage();
        this.state = 'cancelled';
        // tslint:disable-next-line:max-line-length
        this.toastService.addMessage(`Your reservation has been successfully cancelled.`, `Cancelled`, Constants.ToastTypes.INFO);
        break;
    }
  }
}
