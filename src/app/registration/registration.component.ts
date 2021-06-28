import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { PostPass } from '../models/pass';
import { FacilityService } from '../services/facility.service';
import { PassService } from '../services/pass.service';
import { ToastService } from '../services/toast.service';
import { Constants } from '../shared/utils/constants';

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

  // States: facility-select, contact-form, success
  public state = 'facility-select';
  public backButtonText = 'Home';

  constructor(
    private router: Router,
    private facilityService: FacilityService,
    private passService: PassService,
    private toastService: ToastService
  ) {
    // Prevent us from loading into /registration without going through the root page.
    // tslint:disable-next-line: max-line-length
    if (!this.router.getCurrentNavigation() || !this.router.getCurrentNavigation().extras || !this.router.getCurrentNavigation().extras.state) {
      this.router.navigate(['']);
    } else {
      this.park = this.router.getCurrentNavigation().extras.state.park;
    }
  }

  ngOnInit(): void {
    this.facilityService.getListValue()
      .pipe(takeWhile(() => this.alive))
      .subscribe((res) => {
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
    if (confirm('Are you sure you want to leave? You will lose your data if you continue!')) {
      switch (this.state) {
        case 'facility-select':
          this.router.navigate(['']);
          break;
        case 'contact-form':
          this.state = 'facility-select';
          this.backButtonText = 'Home';
          break;
        default:
          break;
      }
    }
  }

  getFacilityFormObj(event): void {
    this.facilityFormObj = event;
    this.state = 'contact-form';
    this.backButtonText = 'Facilities';
  }

  getContactFormObj(event): void {
    this.contactFormObj = event;
    this.regData = { ... this.facilityFormObj, ...this.contactFormObj };
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
      this.router.navigate(['']);
    }
    this.state = 'success';
  }

  populatePassObj(obj) {
    // Mandatory fields:
    obj.firstName = this.regData.firstName;
    obj.lastName = this.regData.lastName;
    obj.facilityName = this.regData.passType.name;
    obj.numberOfGuests = this.regData.passCount;
    obj.email = this.regData.email;
    obj.date = new Date(this.regData.visitDate.year, this.regData.visitDate.month - 1, this.regData.visitDate.day, 12, 0, 0, 0);
    obj.type = this.regData.visitTime;
    obj.parkName = this.park.name;
    obj.facilityType = this.regData.passType.type;

    // Optional fields:
    if (this.regData.phone) {
      obj.phoneNumber = this.regData.phone;
    } else {
      delete obj.phone;
    }
    if (this.regData.license) {
      obj.license = this.regData.license;
    } else {
      delete obj.license;
    }
  }
}
