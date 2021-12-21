import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// components
import { PassLookupComponent } from './pass-lookup.component';
import { PassLookupFormComponent } from './pass-lookup-form/pass-lookup-form.component';
import { AlertModule } from '../shared/components/alert/alert.module';

@NgModule({
  declarations: [PassLookupComponent, PassLookupFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertModule]
})
export class PassLookupModule {}
