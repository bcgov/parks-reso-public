import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration.component';
import { ParkDetailsComponent } from './park-details/park-details.component';
import { FacilitySelectComponent } from './facility-select/facility-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { SuccessComponent } from './success/success.component';
import { FailureComponent } from './failure/failure.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { ImportantBookingInfoModule } from '../shared/components/important-booking-info/important-booking-info.module';
import { DatePickerModule } from '../shared/components/date-picker/date-picker.module';
import { RegistrationDetailsComponent } from './registration-details/registration-details.component';
import { CaptchaModule } from '../shared/components/captcha/captcha.module';

@NgModule({
  declarations: [
    RegistrationComponent,
    ParkDetailsComponent,
    FacilitySelectComponent,
    ContactFormComponent,
    SuccessComponent,
    FailureComponent,
    GuidelinesComponent,
    RegistrationDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ImportantBookingInfoModule,
    DatePickerModule,
    CaptchaModule
  ],
  providers: []
})
export class RegistrationModule {}
