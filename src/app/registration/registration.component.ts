import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { FacilityService } from '../services/facility.service';
import { Constants } from '../shared/utils/constants';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  private alive = true;

  public park;

  public facilities = [];

  private facilityFormObj;
  private contactFormObj;
  public regData;

  // States: facility-select, contact-form, success
  public state = 'facility-select';
  public backButtonText = 'Home';

  constructor(
    private router: Router,
    private facilityService: FacilityService
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
          this.facilities = res;
        }
      });
  }

  navigate(): void {
    if (confirm('Are you sure you want to leave, you will lose your data if you continue!')) {
      switch (this.state) {
        case 'facility-select':
          this.router.navigate(['']);
          break;
        case 'contact-form':
          this.state = 'facility-select';
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
    this.state = 'success';
    this.backButtonText = '';
  }
}
