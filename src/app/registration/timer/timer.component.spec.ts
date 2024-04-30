
import { RouterTestingModule } from '@angular/router/testing';
import { TimerComponent } from './timer.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TimerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize timeRemaining to "5:00"', () => {
    expect(component.timeRemaining).toBe('5:00');
  });

  it('should emit timerExpire event when timer expires', () => {
    spyOn(component.timerExpire, 'emit');
    component.timerExpiry();
    expect(component.timerExpire.emit).toHaveBeenCalled();
  });

  it('should set the timer correctly', () => {
    const endDateTime = new Date(); // Replace with your desired end date/time
    component.setTimer(endDateTime);
    expect(component.intervalTimer).toBeDefined();
    // Add more assertions as needed
  });

  // Add more unit tests for other methods and properties of TimerComponent

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
