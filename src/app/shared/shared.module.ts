import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Utils } from './utils/utils';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { RegistrationDetailsComponent } from './components/registration-details/registration-details.component';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  declarations: [
    DatePickerComponent,
    RegistrationDetailsComponent,
  ],
  entryComponents: [
  ],
  exports: [
    DatePickerComponent,
    RegistrationDetailsComponent
  ],
  providers: [
    Utils
  ]
})

export class SharedModule { }
