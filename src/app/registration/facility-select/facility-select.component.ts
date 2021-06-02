import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Constants } from 'src/app/shared/utils/constants';

@Component({
  selector: 'app-facility-select',
  templateUrl: './facility-select.component.html',
  styleUrls: ['./facility-select.component.scss']
})
export class FacilitySelectComponent implements OnInit {
  @Input() facilities;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();
  public myForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.myForm = new FormGroup({
      visitDate: new FormControl(),
      passType: new FormControl(),
      passCount: new FormControl()
    });
  }

  submit(): void {
    // TODO: Validation
    const obj = {
      visitDate: this.myForm.get('visitDate').value,
      passType: this.myForm.get('passType').value,
      passCount: this.myForm.get('passCount').value
    };
    this.emitter.emit(obj);
  }
}
