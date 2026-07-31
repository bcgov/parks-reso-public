import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      declarations: [TimerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    component.expiry = DateTime.now().plus({ minutes: 7 });
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ngOnInit calls DateTime.now() again rather than reusing the instant the
  // expiry was built from, so any elapsed time between the two reads truncates
  // 4m59.99s down to "4:59". Freezing the clock keeps both reads identical.
  it('should set the time remaining based on the expiry input', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 0, 1, 12, 0, 0));
      component.expiry = DateTime.now().plus({ minutes: 5 });
      component.ngOnInit();

      expect(component.timeRemaining).toBe('5:00');
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should emit timerExpire event when timer expires', () => {
    spyOn(component.timerExpire, 'emit');
    component.timerExpiry();
    expect(component.timerExpire.emit).toHaveBeenCalled();
  });

  it('should clear interval timer on component destroy', () => {
    spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(window.clearInterval).toHaveBeenCalledWith(component.intervalTimer);
  });
});
