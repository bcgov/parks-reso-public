import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pass-lookup-form',
  templateUrl: './pass-lookup-form.component.html',
  styleUrls: ['./pass-lookup-form.component.scss']
})
export class PassLookupFormComponent implements OnInit {
  @Output() submitEvent = new EventEmitter<any>();

  public formData = {
    confirmation: '',
    email: '',
  };

  public lookupForm = new FormGroup({
    confirmation: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email)
  });

  constructor() { }

  ngOnInit(): void {
  }

  resetForm(): void {
    this.lookupForm.reset();
  }

  onSubmit(): void {
    this.updateFormData();
    this.submitEvent.emit(this.formData);
  }

  updateFormData(): void {
    this.formData.confirmation = this.lookupForm.get('confirmation').value;
    this.formData.email = this.lookupForm.get('email').value;
  }

}
