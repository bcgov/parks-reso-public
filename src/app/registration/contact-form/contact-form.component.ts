import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, AbstractControl, ValidationErrors, AbstractControlOptions } from '@angular/forms';
import { ConfigService } from 'src/app/shared/services/config.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  @Input() passData;
  @Input() park;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();
  public myForm: UntypedFormGroup;
  public collectionNoticeCheck = false;
  public weatherStatementCheck = false;
  public liabilityNoticeCheck = false;
  public captchaCheck = false;
  public assetsUrl;
  public saving = false;
  public captchaJwt: string;
  public displayWinterWarning = false;

  public months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private configService: ConfigService,
    private changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.displayWinterWarning = this.park?.winterWarning
    this.assetsUrl = this.configService.config['ASSETS_S3_URL'];
  }

  initForm(): void {
    this.myForm = new UntypedFormGroup({
      firstName: new UntypedFormControl(),
      lastName: new UntypedFormControl(),
      email: new UntypedFormControl(),
      emailCheck: new UntypedFormControl()
    });
    this.myForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      emailCheck: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]]
    },
    {
      validator: this.checkMatchEmails('email', 'emailCheck')
    } as AbstractControlOptions);
  }

  keyPressNumbers(event) {
    let charCode = event.which ? event.which : event.keyCode;
    // Only Numbers 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  getMonthString(monthNo): string {
    return this.months[monthNo - 1];
  }

  checkMatchEmails(email: string, emailCheck: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control) {
        let emailVal = control.get(email).value;
        let emailCheckVal = control.get(emailCheck).value;

        if (emailVal !== '' && emailVal !== emailCheckVal) {
          return { not_the_same: true };
        }
        return null;
      }
    };
  }

  submit(): void {
    this.saving = true;
    const obj = {
      firstName: this.myForm.get('firstName').value,
      lastName: this.myForm.get('lastName').value,
      email: this.myForm.get('email').value,
      phone: this.myForm.get('phone').value,
      captchaJwt: this.captchaJwt
    };
    this.emitter.emit(obj);
  }

  captchaValidated(event): void {
    this.captchaJwt = event;
    this.captchaCheck = true;
    this.changeDetectionRef.detectChanges();
  }

  winterWaiverCheck(): boolean {
    if (this.displayWinterWarning) {
      return (this.liabilityNoticeCheck && this.weatherStatementCheck)
    } else {
      return true
    }
  }
}
