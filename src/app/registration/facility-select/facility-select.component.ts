import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-facility-select',
  templateUrl: './facility-select.component.html',
  styleUrls: ['./facility-select.component.scss']
})

export class FacilitySelectComponent implements OnInit {
  @Input() facilities;
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(DatePickerComponent) dateFormChild: DatePickerComponent;

  public myForm: FormGroup;
  public canSubmit = false;
  public minDate = new Date();
  public maxDate = new Date();

  // time of day passes become available (24h time, PST/PDT)
  public openingHour = 7;

  // number of days in advance you can book after openingHour
  public dateLimit = 1;

  // Order of form states progressing from start to finish
  public stateOrder = ['blank', 'date', 'time', 'passes', 'complete'];
  // Initial state
  public state = 0;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkPassType();
    this.setAvailableDates();
  }

  setAvailableDates(): void {
    // check the current time in the America/Vancouver TZ (must do this step to acct for PST/PDT)
    const currentHour = new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/Vancouver' });
    // if it is after 'openingHour' in America/Vancouver, allow booking up to 'dateLimit' days in advance
    if (parseInt(currentHour, 10) >= this.openingHour) {
      this.maxDate.setDate(this.maxDate.getDate() + this.dateLimit);
    }
  }

  dateChangeEvent(): void {
    this.setState('time');
  }

  checkPassType(): string {
    if (this.myForm.get('passType').value && this.myForm.get('passType').value.type) {
      if (this.myForm.get('passType').value.type === 'parking') {
        this.myForm.patchValue({ passCount: '1' });
      }
      return this.myForm.get('passType').value.type;
    }
    return null;
  }

  isDisabled(stateStr): boolean {
    if (this.state < this.stateOrder.findIndex((element) => element === stateStr)) {
      return true;
    }
    return false;
  }

  clearFormByState(stateStr): void {
    if (this.getStateByString(stateStr) >= this.getStateByString('passes')) {
      return;
    }
    if (this.getStateByString(stateStr) < this.getStateByString('passes')) {
      this.myForm.controls['visitTime'].reset();
    }
    if (this.getStateByString(stateStr) < this.getStateByString('time')) {
      this.dateFormChild.clearDate();
    }
    if (this.getStateByString(stateStr) < this.getStateByString('date')) {
      this.myForm.controls['passType'].reset();
    }

  }

  getStateByString(stateStr): number {
    return this.stateOrder.findIndex((element) => element === stateStr);
  }

  setState(setState): void {
    this.clearFormByState(setState);
    this.state = this.stateOrder.findIndex((element) => element === setState);
  }

  initForm(): void {
    this.myForm = this.fb.group(
      {
        visitDate: ['', Validators.required],
        visitTime: ['', Validators.required],
        passType: ['', Validators.required],
        passCount: ['', Validators.required]
      }
    );
  }

  submit(): void {
    const obj = {
      visitDate: this.myForm.get('visitDate').value,
      visitTime: this.myForm.get('visitTime').value,
      passType: this.myForm.get('passType').value,
      passCount: this.myForm.get('passCount').value
    };
    this.emitter.emit(obj);
  }
}
