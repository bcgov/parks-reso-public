import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

// components
import { PassLookupComponent } from './pass-lookup.component';
import { PassLookupFormComponent } from './pass-lookup-form/pass-lookup-form.component';

@NgModule({
  declarations: [
    PassLookupComponent,
    PassLookupFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
  ]
})
export class PassLookupModule { }
