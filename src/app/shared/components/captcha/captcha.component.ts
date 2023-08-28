import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CaptchaDataService } from './captcha-data.service';

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss']
})
export class CaptchaComponent implements OnInit {
  @ViewChild('audioElement') audioElement: ElementRef;
  @Output() validAnswerEvent = new EventEmitter<string>();
  @Input() facility;
  @Input() orcs;
  @Input() bookingDate;
  @Input() passType

  public answer: string;
  public captchaImage: SafeHtml;
  public captchaAudio: string;
  public state: 'loading' | 'ready' | 'verifying' | 'valid' | 'invalid' | 'error' = 'loading';
  public fetchingAudio = false;

  public captchaData: any;

  constructor(
    private captchaService: CaptchaDataService,
    private sanitizer: DomSanitizer,
    private changeDetectionRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.fetchCaptcha();
  }

  async answerChanged() {
    if (this.answer.length === 6) {
      try {
        this.state = 'verifying';
        const res = await this.captchaService.verifyCaptcha(this.captchaData.validation, this.answer);
        if (res.valid === true) {
          this.state = 'valid';
          this.validAnswerEvent.emit(res.jwt);
        } else {
          this.state = 'invalid';
        }
      } catch (err) {
        this.state = 'invalid';
      }
    }
  }

  async fetchCaptcha() {
    try {
      this.state = 'loading';
      this.captchaAudio = null;
      this.answer = null;
      const res = await this.captchaService.getCaptcha(this.facility, this.orcs, this.formatBookingDate(this.bookingDate), this.passType);
      this.captchaData = res;
      this.state = 'ready';

      this.captchaImage = this.sanitizer.bypassSecurityTrustHtml(this.captchaData.captcha);
    } catch (err) {
      this.state = 'error';
    }
  }

  formatBookingDate(date) {
    return new Date(date.year, date.month - 1, date.day).toISOString();
  }

  async fetchAudio() {
    try {
      this.fetchingAudio = true;
      const res = await this.captchaService.getCaptchaAudio(this.captchaData.validation);
      this.captchaAudio = res.audio;
      this.changeDetectionRef.detectChanges();
    } catch (err) {
      console.log('Error fetching audio:', err);
    } finally {
      this.fetchingAudio = false;
    }
  }

  async playAudio() {
    if (!this.captchaAudio?.length) {
      await this.fetchAudio();
    }

    this.audioElement.nativeElement.play();
  }

  newCaptcha() {
    this.fetchCaptcha();
  }
}
