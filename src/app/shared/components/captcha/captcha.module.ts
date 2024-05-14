import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CaptchaDataService } from './captcha-data.service';
import { CaptchaComponent } from './captcha.component';

@NgModule({
  declarations: [CaptchaComponent],
  imports: [CommonModule, FormsModule],
  exports: [CaptchaComponent],
  providers: [CaptchaDataService]
})
export class CaptchaModule {}
