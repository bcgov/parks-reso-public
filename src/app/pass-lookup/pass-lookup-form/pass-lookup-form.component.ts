import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pass-lookup-form',
  templateUrl: './pass-lookup-form.component.html',
  styleUrls: ['./pass-lookup-form.component.scss']
})
export class PassLookupFormComponent implements OnInit {
  @Input() urlData: any;
  @Output() submitEvent = new EventEmitter<any>();

  public formData = {
    passId: '',
    email: '',
    park: '',
    date: '',
    type: ''
  };

  public lookupForm = new UntypedFormGroup({
    passId: new UntypedFormControl('', Validators.required),
    email: new UntypedFormControl('', [Validators.email, Validators.required]),
    park: new UntypedFormControl('', Validators.required),
    date: new UntypedFormControl('', Validators.required),
    type: new UntypedFormControl('', Validators.required)
  });

  constructor() { }

  ngOnInit(): void {
    this.disableForm();
    if (this.urlData) {
      this.populateForm(this.urlData);
    }
  }

  disableForm(){
    this.lookupForm.disable();
  }

  enableForm(){
    this.lookupForm.enable();
  }

  populateForm(data): void {
    for (let key in data){
      if (this.lookupForm.get(key)){
        this.lookupForm.controls[key].setValue(data[key]);
      }
    }
  }

  resetForm(): void {
    this.lookupForm.reset();
  }

  onSubmit(): void {
    this.updateFormData();
    this.submitEvent.emit(this.formData);
  }

  updateFormData(): void {
    this.formData.passId = this.lookupForm.get('passId').value;
    this.formData.email = this.lookupForm.get('email').value;
    this.formData.park = this.lookupForm.get('park').value;
    this.formData.date = this.lookupForm.get('date').value;
    this.formData.type = this.lookupForm.get('type').value;
  }

}
