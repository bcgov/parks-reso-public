import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime, Interval } from 'luxon';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrl: './timer.component.scss',
    standalone: false
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() expiry;
  @Output() timerExpire = new EventEmitter;
  public timeLimit = {
    minutes: 5
  };
  public timeRemaining = '7:00';
  public intervalTimer;

  constructor(
    protected router: Router
  ) { }

  ngOnInit(): void {
    // TODO: refactor this to use an end time limit delivered from the api
    const interval = Interval.fromDateTimes(DateTime.now(), this.expiry);
    const remaining = interval.toDuration(['minutes', 'seconds']);
    this.timeRemaining = remaining.toFormat('m:ss');
    this.setTimer(this.expiry);
  }

  setTimer(endDateTime) {
    clearInterval(this.intervalTimer);
    this.intervalTimer = setInterval(() => {
      const interval = Interval.fromDateTimes(DateTime.now(), endDateTime);
      const remaining = interval.toDuration(['minutes', 'seconds']);
      if (remaining?.invalid) {
        // You're out of touch, you're out of time
        clearInterval(this.intervalTimer);
        this.timeRemaining = '0:00';
        this.timerExpiry();
      } else {
        this.timeRemaining = remaining.toFormat('m:ss');
      }
    }, 1000);
  }

  timerExpiry() {
    // Navigate user to home page.
    this.timerExpire.emit();
    this.router.navigate(['']);
    alert("You have not completed your booking within the time allowed, please try again.");
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalTimer);
  }
}
