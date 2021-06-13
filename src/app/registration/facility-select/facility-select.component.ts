import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-facility-select',
  templateUrl: './facility-select.component.html',
  styleUrls: ['./facility-select.component.scss']
})

export class FacilitySelectComponent implements OnInit {
  @Output() emitter: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(DatePickerComponent) dateFormChild: DatePickerComponent;
  @Input() facilities;

  public myForm: FormGroup;
  public canSubmit = false;
  public minDate = new Date();
  public maxDate = new Date();
  public openFacilities = [];
  public closedFacilities = [];
  public timesAvailable = [];
  public timesFull = [];
  public passesAvailable = [];

  // typically imported from configService, below are default values if no configService
  public openingHour = 7;
  public dateLimit = 1;
  public trailPassLimit = 4;
  public parkingPassLimit = 1;

  // Order of form states progressing from start to finish
  public stateOrder = ['blank', 'date', 'time', 'passes', 'complete'];
  // Initial state
  public state = 0;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
  ) { }

  ngOnInit(): void {
    if (this.configService) {
      this.trailPassLimit = this.configService.config['TRAIL_PASS_LIMIT'];
      this.parkingPassLimit = this.configService.config['PARKING_PASS_LIMIT'];
      this.dateLimit = this.configService.config['ADVANCE_BOOKING_LIMIT'];
      this.openingHour = this.configService.config['ADVANCE_BOOKING_HOUR'];
    }
    this.initForm();
    this.checkPassType();
    this.setAvailableDates();
    this.setFacilitiesArrays();
  }

  setFacilitiesArrays() {
    // if facility is open, show it as available.
    // if a facility is closed, show it as unavailable.
    this.openFacilities = [];
    this.closedFacilities = [];
    for (let facility in this.facilities) {
      if (this.facilities[facility].status.state === 'open') {
        this.openFacilities.push(this.facilities[facility]);
      } else {
        this.closedFacilities.push(this.facilities[facility]);
      }
    }
  }

  setTimeArrays(): void {
    // if facility has a time of day and it is not yet at capacity, show it and make available.
    // if facility has a time of day and it is at/over capacity, show it but make it unavailable.
    // if facility has a time of day and there is no capacity limit, make all times available.
    this.timesFull = [];
    this.timesAvailable = [];
    if (this.myForm.get('passType').value && this.myForm.get('passType').value.bookingTimes) {
      const times = this.myForm.get('passType').value.bookingTimes;
      for (let key in times) {
        if (times[key].currentCount < times[key].max || !times[key].max) {
          this.timesAvailable.push(key);
        } else {
          this.timesFull.push(key);
        }
      }
      if (this.timesAvailable.length === 0) {
        this.timesFull = [];
        this.timesFull.push('No times available on this date.');
      }
    }
  }

  setPassesArray(): void {
    // if facility is trail and has >= 'singlePassLimit' passes available, allow client to book up to 'singlePassLimit' passes.
    // if facility is trail and has 1 to 'singlePassLimit' passes available, limit the number of passes to the availability left.
    // if facility has no availablilty, this should be limited in the bookingTimes field.
    // if facility has no capacity limit, allow client to book up to 'singlePassLimit' passes.
    this.passesAvailable = [];
    let numberAvailable = 0;
    if (this.myForm.get('passType').value) {
      const pass = this.myForm.get('passType').value;
      if (this.myForm.get('visitTime').value) {
        const time = this.myForm.get('visitTime').value;
        if (pass.bookingTimes[time] && pass.bookingTimes[time].max && pass.bookingTimes[time].currentCount) {
          numberAvailable = pass.bookingTimes[time].max - pass.bookingTimes[time].currentCount;
        } else {
          numberAvailable = Math.max(this.trailPassLimit, this.parkingPassLimit);
        }
      }
      if (pass.type === 'Trail' && numberAvailable > this.trailPassLimit) {
        numberAvailable = this.trailPassLimit;
      }
      if (pass.type === 'Parking' && numberAvailable > this.parkingPassLimit) {
        numberAvailable = this.parkingPassLimit;
      }
    }
    for (let i = 1; i <= numberAvailable; i++) {
      this.passesAvailable.push(i);
    }
  }

  setAvailableDates(): void {
    // check the current time in the America/Vancouver TZ (must do this step to acct for PST/PDT)
    const currentHour = new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/Vancouver' });
    // if it is after 'openingHour' in America/Vancouver, allow booking up to 'dateLimit' days in advance
    if (parseInt(currentHour, 10) >= this.openingHour) {
      this.maxDate.setDate(this.maxDate.getDate() + this.dateLimit);
    }
  }

  checkPassType(): string {
    if (this.myForm.get('passType').value && this.myForm.get('passType').value.type) {
      if (this.myForm.get('passType').value.type === 'Parking') {
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
      this.myForm.controls['passCount'].reset();
    }
    if (this.getStateByString(stateStr) < this.getStateByString('passes')) {
      this.myForm.controls['visitTime'].reset();
      this.timesAvailable = [];
      this.timesFull = [];
    }
    if (this.getStateByString(stateStr) < this.getStateByString('time')) {
      this.dateFormChild.clearDate();
    }
    if (this.getStateByString(stateStr) < this.getStateByString('date')) {
      this.myForm.reset();
    }

  }

  getStateByString(stateStr): number {
    return this.stateOrder.findIndex((element) => element === stateStr);
  }

  setState(setState): void {
    this.clearFormByState(setState);
    this.state = this.stateOrder.findIndex((element) => element === setState);
    if (this.state === this.getStateByString('blank')) {
      this.setFacilitiesArrays();
    }
    if (this.state === this.getStateByString('time')) {
      this.setTimeArrays();
    }
    if (this.state === this.getStateByString('passes')) {
      this.setPassesArray();
    }
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
