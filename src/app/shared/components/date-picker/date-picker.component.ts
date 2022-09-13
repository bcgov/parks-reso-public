import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  OnInit,
  EventEmitter,
  OnDestroy,
  Output
} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() control: UntypedFormControl;
  @Input() isValidate = false;
  @Input() isDisabled = false;
  @Input() minDate: Date = null;
  @Input() maxDate: Date = null;
  @Input() reset: EventEmitter<any>;
  @Input() required = false;
  @Input() label = '';
  @Input() today: NgbDateStruct = null;

  @Output() formChangeEvent = new EventEmitter<string>();
  @Output() clearEvent = new EventEmitter();

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public ngbDate: NgbDateStruct = null;
  public minNgbDate: NgbDateStruct = null;
  public maxNgbDate: NgbDateStruct = null;

  public loading = true;

  constructor(private changeDetectionRef: ChangeDetectorRef, private utils: Utils) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.minDate && changes.minDate.currentValue) {
      this.minNgbDate = this.utils.convertJSDateToZonedNGBDate(new Date(changes.minDate.currentValue));
    }
    if (changes.maxDate && changes.maxDate.currentValue) {
      this.maxNgbDate = this.utils.convertJSDateToZonedNGBDate(new Date(changes.maxDate.currentValue));
    }

    this.loading = false;
    this.changeDetectionRef.detectChanges();
  }

  ngOnInit(): void {
    this.ngbDate = this.today || null;
    if (this.reset) {
      this.reset.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.clearDate());
    }
  }

  onDateChange(ngbDate: NgbDateStruct): void {
    this.control.setValue(ngbDate);
    this.control.markAsDirty();
    this.formChangeEvent.emit();
  }

  clearDate(): void {
    this.ngbDate = null;
    this.control.setValue(null);
    this.control.markAsDirty();
    this.clearEvent.emit();
  }

  public isValidDate(date: NgbDateStruct): boolean {
    if (date === null && !this.required) {
      return true;
    } else {
      return date && !isNaN(date.year) && !isNaN(date.month) && !isNaN(date.day);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
