import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
    park: ''
  };

  public lookupForm = new FormGroup({
    passId: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.email, Validators.required]),
    park: new FormControl('', Validators.required)
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
  }

}
