import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PassLookupFormComponent } from './pass-lookup-form/pass-lookup-form.component';

@Component({
  selector: 'app-pass-lookup',
  templateUrl: './pass-lookup.component.html',
  styleUrls: ['./pass-lookup.component.scss']
})
export class PassLookupComponent implements OnInit {
  @ViewChild(PassLookupFormComponent) form: PassLookupFormComponent;

  // states: blank, no-match, match, found, cancelled
  public state = 'blank';

  public resData = {
    confirmation: '',
    email: '',
    secret: ''
  };

  public backButtonText = 'Home';

  public mockData = {
    firstName: 'John',
    lastName: 'Smith',
    email: '123abc@gmail.ca',
    visitDate: new Date(),
    passType: {
      name: 'Goldstream',
    },
    passCount: 3,
    confirmation: '123456789abc'
  };

  public title = 'Cancel a reservation';

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

  }

  navigate(): void {
    this.resetPage();
    this.router.navigate(['']);
  }

  onSubmit(event): void {
    this.populateData(event);
    if (this.resData.confirmation === this.mockData.confirmation && this.resData.email === this.mockData.email) {
      this.form.resetForm();
      this.state = 'match';
    } else {
      this.state = 'no-match';
    }
  }

  populateData(data): void {
    this.resData.confirmation = data.confirmation;
    this.resData.email = data.email;
  }

  resetPage(): void {
    if (this.form) {
      this.form.resetForm();
    }
    this.resData.confirmation = '';
    this.resData.email = '';
    this.resData.secret = '';
  }

  cancelReservation(): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.resetPage();
      this.state = 'cancelled';
    }
  }

  changeState(state): void {
    switch (state) {
      case 'blank':
        this.resetPage();
        this.state = 'blank';
        break;
      case 'match':
        this.resetPage();
        this.state = 'match';
        break;
      case 'no-match':
        this.state = 'no-match';
        break;
      case 'found':
        this.state = 'found';
        break;
      case 'cancelled':
        this.resetPage();
        this.state = 'cancelled';
        break;
    }
  }
}
