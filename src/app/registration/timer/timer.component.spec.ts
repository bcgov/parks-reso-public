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

  it('should set the time remaining based on the expiry input', () => {
    const expiry = DateTime.now().plus({ minutes: 5 });
    component.expiry = expiry;
    component.ngOnInit();
    expect(component.timeRemaining).toBe('4:59');
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
