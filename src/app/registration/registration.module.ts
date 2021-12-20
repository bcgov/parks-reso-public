import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration.component';
import { ParkDetailsComponent } from './park-details/park-details.component';
import { FacilitySelectComponent } from './facility-select/facility-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { SuccessComponent } from './success/success.component';
import { FailureComponent } from './failure/failure.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { CaptchaComponent } from '../captcha/captcha.component';
import { ImportantBookingInfoModule } from '../shared/components/important-booking-info/important-booking-info.module';

@NgModule({
  declarations: [
    RegistrationComponent,
    ParkDetailsComponent,
    FacilitySelectComponent,
    ContactFormComponent,
    SuccessComponent,
    FailureComponent,
    GuidelinesComponent,
    CaptchaComponent
  ],
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, ImportantBookingInfoModule]
})
export class RegistrationModule {}
