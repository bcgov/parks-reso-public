import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  @Input() passData;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();
  public myForm: FormGroup;
  public iAgree = false;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log(this.passData);
    this.initForm();
  }

  initForm(): void {
    this.myForm = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      email: new FormControl(),
      license: new FormControl()
    });
    this.myForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.pattern('^[0-9]{10}$')]],
        license: ['', Validators.required]
      }
    );
    if (this.passData && this.passData.passType && this.passData.passType.type) {
      if (this.passData.passType.type === 'trail') {
        this.myForm.controls['license'].clearValidators();
      }
    }
  }

  submit(): void {
    const obj = {
      firstName: this.myForm.get('firstName').value,
      lastName: this.myForm.get('lastName').value,
      email: this.myForm.get('email').value,
      phone: this.myForm.get('phone').value,
      license: this.myForm.get('license').value
    };
    this.emitter.emit(obj);
  }
}
