import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  public myForm: FormGroup;
  public collectionNoticeCheck = false;
  public weatherStatementCheck = false;
  public liabilityNoticeCheck = false;
  public captchaCheck = false;
  public assetsUrl;
  public saving = false;
  public captchaJwt: string;

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
    private fb: FormBuilder,
    private configService: ConfigService,
    private changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.assetsUrl = this.configService.config['ASSETS_S3_URL'];
  }

  initForm(): void {
    this.myForm = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      email: new FormControl(),
      license: new FormControl()
    });
    this.myForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      license: ['', Validators.required]
    });
    if (this.passData && this.passData.passType && this.passData.passType.type) {
      if (this.passData.passType.type !== 'Parking') {
        this.myForm.controls['license'].clearValidators();
      }
    }
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

  submit(): void {
    this.saving = true;
    const obj = {
      firstName: this.myForm.get('firstName').value,
      lastName: this.myForm.get('lastName').value,
      email: this.myForm.get('email').value,
      phone: this.myForm.get('phone').value,
      license: this.myForm.get('license').value,
      captchaJwt: this.captchaJwt
    };
    this.emitter.emit(obj);
  }

  captchaValidated(event): void {
    this.captchaJwt = event;
    this.captchaCheck = true;
    this.changeDetectionRef.detectChanges();
  }
}
