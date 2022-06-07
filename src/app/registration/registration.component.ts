import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { PostPass } from '../models/pass';
import { FacilityService } from '../services/facility.service';
import { PassService } from '../services/pass.service';
import { ToastService } from '../services/toast.service';
import { Constants } from '../shared/utils/constants';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  private alive = true;
  public loading = true;

  public park;
  public submitRes;

  public facilities = [];

  private facilityFormObj;
  private contactFormObj;
  public regData;
  public error = false;
  public errorContent = {};

  // States: facility-select, contact-form, success, failure
  public state = 'facility-select';
  public backButtonText = 'Home';

  constructor(
    private router: Router,
    private facilityService: FacilityService,
    private passService: PassService,
    private toastService: ToastService
  ) {
    // Prevent us from loading into /registration without going through the root page.
    // eslint-disable-next-line max-len
    if (
      !this.router.getCurrentNavigation() ||
      !this.router.getCurrentNavigation().extras ||
      !this.router.getCurrentNavigation().extras.state
    ) {
      this.router.navigate(['']);
    } else {
      this.park = this.router.getCurrentNavigation().extras.state.park;
    }
  }

  ngOnInit(): void {
    this.scrollToTop();
    this.facilityService
      .getListValue()
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        if (res) {
          if (res === 'error') {
            this.error = true;
          } else {
            this.facilities = res;
            this.loading = false;
          }
        }
      });
  }

  navigate(): void {
    if (
      this.state !== 'failure' &&
      confirm('Are you sure you want to leave? You will lose your data if you continue!')
    ) {
      switch (this.state) {
        case 'facility-select':
          this.router.navigate(['']);
          break;
        case 'contact-form':
          this.state = 'facility-select';
          this.scrollToTop();
          this.backButtonText = 'Home';
          break;
        default:
          break;
      }
    } else {
      this.state = 'facility-select';
      this.scrollToTop();
      this.backButtonText = 'Home';
    }
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  getFacilityFormObj(event): void {
    this.facilityFormObj = event;
    this.state = 'contact-form';
    this.scrollToTop();
    this.backButtonText = 'Facilities';
  }

  getContactFormObj(event): void {
    this.contactFormObj = event;
    this.regData = { ...this.facilityFormObj, ...this.contactFormObj };
    this.regData['registrationNumber'] = '1234asdf';
    this.submit();
  }

  async submit() {
    // TODO: check facility capacity for date, update facility with new capacity
    try {
      const postObj = new PostPass();
      this.populatePassObj(postObj);
      this.submitRes = await this.passService.createPass(postObj, this.park.sk, this.regData.passType.sk);
      this.backButtonText = '';
      this.toastService.addMessage(`Pass successfully registered.`, `Success`, Constants.ToastTypes.SUCCESS);
    } catch (error) {
      this.scrollToTop();
      this.backButtonText = 'Retry';
      this.state = 'failure';
      this.facilityService.fetchData(null, this.park.sk);
      this.errorContent = error.error;
      return;
    }
    this.scrollToTop();
    this.state = 'success';
  }

  populatePassObj(obj) {
    const visitDateTime = DateTime.fromObject(
      {
        year: this.regData.visitDate.year,
        month: this.regData.visitDate.month,
        day: this.regData.visitDate.day,
        hour: 12,
        minute: 0,
        second: 0,
        millisecond: 0
      },
      {
        zone: 'America/Vancouver'
      }
    );
    const visitUTCISODate = visitDateTime.toUTC().toISO();
    // Mandatory fields:
    obj.firstName = this.regData.firstName;
    obj.lastName = this.regData.lastName;
    obj.facilityName = this.regData.passType.name;
    obj.numberOfGuests = this.regData.passCount;
    obj.email = this.regData.email;
    obj.date = visitUTCISODate;
    obj.type = this.regData.visitTime;
    obj.parkName = this.park.name;
    obj.facilityType = this.regData.passType.type;
    obj.captchaJwt = this.regData.captchaJwt;

    // Optional fields:
    if (this.regData.phone) {
      obj.phoneNumber = this.regData.phone;
    } else {
      delete obj.phone;
    }
  }
}
