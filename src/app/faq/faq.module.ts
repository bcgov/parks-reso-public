import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// components
import { FaqComponent } from './faq.component';
import { AlertModule } from '../shared/components/alert/alert.module';

@NgModule({
  declarations: [FaqComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertModule]
})
export class FaqModule {}
