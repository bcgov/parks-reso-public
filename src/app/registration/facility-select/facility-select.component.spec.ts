import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfigService } from 'src/app/services/config.service';
import { RegistrationModule } from '../registration.module';

import { FacilitySelectComponent } from './facility-select.component';

describe('FacilitySelectComponent', () => {
  let component: FacilitySelectComponent;
  let fixture: ComponentFixture<FacilitySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [RegistrationModule],
      providers: [ConfigService, HttpClient, HttpHandler],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilitySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('availability text display', () => {
    function setupVisitTimeState(facilities: any[], visitDate: Date): void {
      component.facilities = facilities;
      component.ngOnInit();
      fixture.detectChanges();

      const facilityElement = fixture.debugElement;
      const passTypeElement = facilityElement.query(
        By.css('[data-testid="passtype-select"]')
      ).nativeElement;
      passTypeElement.value = passTypeElement.options[1].value;
      passTypeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      component.myForm.patchValue({
        visitDate: {
          year: visitDate.getFullYear(),
          month: visitDate.getMonth(),
          day: visitDate.getDate(),
        },
      });

      const datePickerComponent = fixture.debugElement.query(
        By.css('app-date-picker')
      );
      datePickerComponent.triggerEventHandler('formChangeEvent', null);
      fixture.detectChanges();
    }

    it('should show high availability with no bookings', () => {
      setupVisitTimeState(
        [
          {
            visible: true,
            bookingTimes: { DAY: { max: 1 } },
            status: { stateReason: null, state: 'open' },
            sk: 'Test facility 1',
            pk: 'facility::Garibaldi Provincial Park',
            name: 'Test facility 1',
            reservations: {},
            type: 'Parking',
          },
        ],
        new Date()
      );

      const textElement = fixture.debugElement.query(
        By.css('[data-testid="day-availability-text"]')
      );
      expect(textElement.nativeElement.textContent).toContain(
        'Pass availability - High'
      );
    });

    it('should show high availability with 75% of spots available', () => {
      const date = new Date();
      setupVisitTimeState(
        [
          {
            visible: true,
            bookingTimes: { DAY: { max: 100 } },
            status: { stateReason: null, state: 'open' },
            sk: 'Test facility 1',
            pk: 'facility::Garibaldi Provincial Park',
            name: 'Test facility 1',
            reservations: {
              [`${date.getFullYear()}${date.getMonth()}${date.getDate()}`]: {
                DAY: 25,
              },
            },
            type: 'Parking',
          },
        ],
        date
      );

      const textElement = fixture.debugElement.query(
        By.css('[data-testid="day-availability-text"]')
      );
      expect(textElement.nativeElement.textContent).toContain(
        'Pass availability - High'
      );
    });

    it('should show moderate availability with 25% of spots available', () => {
      const date = new Date();
      setupVisitTimeState(
        [
          {
            visible: true,
            bookingTimes: { DAY: { max: 100 } },
            status: { stateReason: null, state: 'open' },
            sk: 'Test facility 1',
            pk: 'facility::Garibaldi Provincial Park',
            name: 'Test facility 1',
            reservations: {
              [`${date.getFullYear()}${date.getMonth()}${date.getDate()}`]: {
                DAY: 75,
              },
            },
            type: 'Parking',
          },
        ],
        date
      );

      const textElement = fixture.debugElement.query(
        By.css('[data-testid="day-availability-text"]')
      );
      expect(textElement.nativeElement.textContent).toContain(
        'Pass availability - Moderate'
      );
    });

    it('should show low availability with 24% of spots available', () => {
      const date = new Date();
      setupVisitTimeState(
        [
          {
            visible: true,
            bookingTimes: { DAY: { max: 100 } },
            status: { stateReason: null, state: 'open' },
            sk: 'Test facility 1',
            pk: 'facility::Garibaldi Provincial Park',
            name: 'Test facility 1',
            reservations: {
              [`${date.getFullYear()}${date.getMonth()}${date.getDate()}`]: {
                DAY: 76,
              },
            },
            type: 'Parking',
          },
        ],
        date
      );

      const textElement = fixture.debugElement.query(
        By.css('[data-testid="day-availability-text"]')
      );
      expect(textElement.nativeElement.textContent).toContain(
        'Pass availability - Low'
      );
    });

    it('should show as full with no spots available', () => {
      const date = new Date();
      setupVisitTimeState(
        [
          {
            visible: true,
            bookingTimes: { DAY: { max: 100 } },
            status: { stateReason: null, state: 'open' },
            sk: 'Test facility 1',
            pk: 'facility::Garibaldi Provincial Park',
            name: 'Test facility 1',
            reservations: {
              [`${date.getFullYear()}${date.getMonth()}${date.getDate()}`]: {
                DAY: 100,
              },
            },
            type: 'Parking',
          },
        ],
        date
      );

      const textElement = fixture.debugElement.query(
        By.css('[data-testid="day-availability-text"]')
      );
      expect(textElement.nativeElement.textContent).toContain(
        'Pass availability - Full'
      );
    });

    it('should show as full when overbooked', () => {
      const date = new Date();
      setupVisitTimeState(
        [
          {
            visible: true,
            bookingTimes: { DAY: { max: 100 } },
            status: { stateReason: null, state: 'open' },
            sk: 'Test facility 1',
            pk: 'facility::Garibaldi Provincial Park',
            name: 'Test facility 1',
            reservations: {
              [`${date.getFullYear()}${date.getMonth()}${date.getDate()}`]: {
                DAY: 110,
              },
            },
            type: 'Parking',
          },
        ],
        date
      );

      const textElement = fixture.debugElement.query(
        By.css('[data-testid="day-availability-text"]')
      );
      expect(textElement.nativeElement.textContent).toContain(
        'Pass availability - Full'
      );
    });
  });
});
