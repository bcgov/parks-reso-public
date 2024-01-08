import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AbstractControlOptions
} from '@angular/forms';
import {
  CountryISO,
  SearchCountryField
} from "@moddi3/ngx-intl-tel-input";
import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';
import { ConfigService } from 'src/app/shared/services/config.service';
import { Constants } from 'src/app/shared/utils/constants';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss' ]
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
  public isPhoneRequired = false;
  public placeholderFormat = "+1 506-234-5678";
  public countryName = "Canada";
  public dialCode = "+1";
  public maxLength = 12;
  public phoneNumber = '';
  public iso2 = "ca"
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

  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private configService: ConfigService,
    private changeDetectionRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.displayWinterWarning = this.park?.winterWarning;
    this.myForm.get('phone').disable();
    this.myForm.get('enablePhone').setValue(false);
    this.assetsUrl = this.configService.config['ASSETS_S3_URL'];
    this.myForm.get('enablePhone').valueChanges.subscribe((value) => {
      const phoneControl = this.myForm.get('phone');
      if (value) {
        phoneControl.enable();
      } else {
        phoneControl.disable();
        phoneControl.setValue('');
      }
    });
    this.myForm.get('enablePhone').valueChanges.subscribe((enablePhoneValue) => {
      const phoneControl = this.myForm.get('phone');
      if (enablePhoneValue) {
        phoneControl.setValidators([Validators.required, this.phoneValidator]);
      } else {
        phoneControl.setValidators([Validators.required]);
      } 
      phoneControl.updateValueAndValidity();
    });
  }

  initForm(): void {
    this.myForm = new UntypedFormGroup({
      firstName: new UntypedFormControl(),
      lastName: new UntypedFormControl(),
      email: new UntypedFormControl(),
      emailCheck: new UntypedFormControl(),
      phone: new UntypedFormControl(),
      enablePhone: new UntypedFormControl(),
      phoneInvalid: new UntypedFormControl()
    });
    this.myForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.pattern(Constants.emailValidationRegex)]],
        emailCheck: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        enablePhone: ['', [Validators.required]]
      },
      {
        validators: [this.checkMatchEmails('email', 'emailCheck'), this.checkPhoneNumber('phone', 'enablePhone') ],
      } as AbstractControlOptions
    );
  }

  get email() {
    return this.myForm.get('email');
  }

  get emailCheck() {
    return this.myForm.get('emailCheck');
  }
  get phone() {
    return this.myForm.get('phone');
  }
  get enablePhone() {
    return this.myForm.get('enablePhone');
  }

  updateMaxLength(placeholder: string): void {
    const placeholderWithoutDialCode = placeholder.slice(this.dialCode.length + 1);
    this.maxLength = placeholderWithoutDialCode.length;
    console.log("MAX LENGTH: ", this.maxLength);
  }
  
  onCountryChange(event: any): void{
    this.countryName = event.name;
    this.dialCode = `+${event.dialCode}`;
    this.updateMaxLength(event.placeHolder);
    this.iso2 = event.iso2;
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

  justNumbers(phoneNumber): string{
    return phoneNumber.replace(/\D/g, '')
  }

  getMonthString(monthNo): string {
    return this.months[monthNo - 1];
  }

  checkPhoneNumber(phone: string, enablePhone: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      let phoneVal: string | null = control.get(phone).value;
      let enablePhoneVal: boolean | null = control.get(enablePhone).value;
      if (enablePhoneVal && !phoneVal) {
        return { phoneRequired: true };
      }
      return null;
    };
  }

  checkMatchEmails(email: string, emailCheck: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control) {
        let emailVal = control.get(email).value;
        let emailCheckVal = control.get(emailCheck).value;

        if (emailVal !== '' && emailVal !== emailCheckVal) {
          return { notTheSame: true };
        }
        return null;
      }
    };
  }

  submit(): void {
    const combinedValue = this.dialCode + this.myForm.get('phone').value.number;
    this.saving = true;
    const obj = {
      firstName: this.myForm.get('firstName').value,
      lastName: this.myForm.get('lastName').value,
      email: this.myForm.get('email').value,
      phone: `+${this.justNumbers(combinedValue)}`,
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
      return this.liabilityNoticeCheck && this.weatherStatementCheck;
    } else {
      return true;
    }
  }

  phoneValidator = (control: AbstractControl): ValidationErrors | null => {
    const phoneInput = control.parent.get('phone').value;
    if (!phoneInput?.number) {
      return { invalidPhoneNumber: true, message: 'Phone number is required' };
    }
    const sanitizedPhone = phoneInput.number.replace(/\D/g, '');
    const phoneNumberUtil = PhoneNumberUtil.getInstance();
    try {
      const parsedNumber: PhoneNumber = phoneNumberUtil.parse(sanitizedPhone, this.iso2);
      if (!phoneNumberUtil.isValidNumber(parsedNumber)) {
        return { invalidPhoneNumber: true, message: 'Invalid phone number for the selected region' };
      }
    } catch (error) {
      return { invalidPhoneNumber: true, message: 'Error parsing the phone number' };
    }
    return null;
  }
  
}
