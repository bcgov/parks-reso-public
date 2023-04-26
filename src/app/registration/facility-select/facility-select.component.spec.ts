import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfigService } from 'src/app/shared/services/config.service';
import { Utils } from 'src/app/shared/utils/utils';

import { RegistrationModule } from '../registration.module';

import { FacilitySelectComponent } from './facility-select.component';

describe('FacilitySelectComponent', () => {
  let component: FacilitySelectComponent;
  let fixture: ComponentFixture<FacilitySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [RegistrationModule],
      providers: [ConfigService, HttpClient, HttpHandler, Utils]
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
      // initialize the component
      component.facilities = facilities;
      component.ngOnInit();
      fixture.detectChanges();

      // set the visit date
      component.myForm.patchValue({
        visitDate: {
          year: visitDate.toLocaleString('en-US', { year: 'numeric', timeZone: 'America/Vancouver' }),
          month: visitDate.toLocaleString('en-US', { month: 'numeric', timeZone: 'America/Vancouver' }),
          day: visitDate.toLocaleString('en-US', { day: 'numeric', timeZone: 'America/Vancouver' })
        }
      });
      const datePickerComponent = fixture.debugElement.query(By.css('app-date-picker'));
      datePickerComponent.triggerEventHandler('formChangeEvent', null);
      fixture.detectChanges();

      // pick a facility
      const facilityElement = fixture.debugElement;
      const passTypeElement = facilityElement.query(By.css('[data-testid="passtype-select"]')).nativeElement;
      passTypeElement.value = passTypeElement.options[1].value;
      passTypeElement.dispatchEvent(new Event('change'));
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
            reservations: {
              '2021-11-23': {
                DAY: {
                  capacity: 'High',
                  max: 1
                }
              }
            },
            type: 'Parking',
            bookingDays: {
              '7': true,
              '1': true,
              '2': true,
              '3': true,
              '4': true,
              '5': true,
              '6': true,
            },
            bookableHolidays: [],
            bookingDaysRichText: ''
          }
        ],
        new Date('2021-11-23T20:02:00.000-08:00')
      );

      const textElement = fixture.debugElement.query(By.css('[data-testid="day-availability-text"]'));
      expect(textElement.nativeElement.textContent).toContain('Pass availability - High');
    });

    it('should show high availability with 75% of spots available', () => {
      const date = new Date('2021-11-23T20:02:00.000-08:00');
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
              '2021-11-23': {
                DAY: {
                  capacity: 'High',
                  max: 1
                }
              }
            },
            type: 'Parking',
            bookingDays: {
              '7': true,
              '1': true,
              '2': true,
              '3': true,
              '4': true,
              '5': true,
              '6': true,
            },
            bookableHolidays: [],
            bookingDaysRichText: ''
          }
        ],
        date
      );

      const textElement = fixture.debugElement.query(By.css('[data-testid="day-availability-text"]'));
      expect(textElement.nativeElement.textContent).toContain('Pass availability - High');
    });

    it('should show moderate availability with 25% of spots available', () => {
      const date = new Date('2021-11-23T20:02:00.000-08:00');
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
              '2021-11-23': {
                DAY: {
                  capacity: 'Moderate',
                  max: 1
                }
              }
            },
            type: 'Parking',
            bookingDays: {
              '7': true,
              '1': true,
              '2': true,
              '3': true,
              '4': true,
              '5': true,
              '6': true,
            },
            bookableHolidays: [],
            bookingDaysRichText: ''
          }
        ],
        date
      );

      const textElement = fixture.debugElement.query(By.css('[data-testid="day-availability-text"]'));
      expect(textElement.nativeElement.textContent).toContain('Pass availability - Moderate');
    });

    it('should show low availability with 24% of spots available', () => {
      const date = new Date('2021-11-23T20:02:00.000-08:00');
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
              '2021-11-23': {
                DAY: {
                  capacity: 'Low',
                  max: 1
                }
              }
            },
            type: 'Parking',
            bookingDays: {
              '7': true,
              '1': true,
              '2': true,
              '3': true,
              '4': true,
              '5': true,
              '6': true,
            },
            bookableHolidays: [],
            bookingDaysRichText: ''
          }
        ],
        date
      );

      const textElement = fixture.debugElement.query(By.css('[data-testid="day-availability-text"]'));
      expect(textElement.nativeElement.textContent).toContain('Pass availability - Low');
    });

    it('should show as full with no spots available', () => {
      const date = new Date('2021-11-23T20:02:00.000-08:00');
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
              '2021-11-23': {
                DAY: {
                  capacity: 'Full',
                  max: 0
                }
              }
            },
            type: 'Parking',
            bookingDays: {
              '7': true,
              '1': true,
              '2': true,
              '3': true,
              '4': true,
              '5': true,
              '6': true,
            },
            bookableHolidays: [],
            bookingDaysRichText: ''
          }
        ],
        date
      );

      const textElement = fixture.debugElement.query(By.css('[data-testid="day-availability-text"]'));
      expect(textElement.nativeElement.textContent).toContain('Pass availability - Full');
    });

    it('should show as full when overbooked', () => {
      const date = new Date('2021-11-23T20:02:00.000-08:00');
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
              '2021-11-23': {
                DAY: {
                  capacity: 'Full',
                  max: 0
                }
              }
            },
            type: 'Parking',
            bookingDays: {
              '7': true,
              '1': true,
              '2': true,
              '3': true,
              '4': true,
              '5': true,
              '6': true,
            },
            bookableHolidays: [],
            bookingDaysRichText: ''
          }
        ],
        date
      );

      const textElement = fixture.debugElement.query(By.css('[data-testid="day-availability-text"]'));
      expect(textElement.nativeElement.textContent).toContain('Pass availability - Full');
    });

    it('should show as full when zero spots available', () => {
      const date = new Date('2021-11-23T20:02:00.000-08:00');
      setupVisitTimeState(
        [
          {
            visible: true,
            bookingTimes: { DAY: { max: 0 } },
            status: { stateReason: null, state: 'open' },
            sk: 'Test facility 1',
            pk: 'facility::Garibaldi Provincial Park',
            name: 'Test facility 1',
            reservations: {
              '2021-11-23': {
                DAY: {
                  capacity: 'Full',
                  max: 0
                }
              }
            },
            type: 'Parking',
            bookingDays: {
              '7': true,
              '1': true,
              '2': true,
              '3': true,
              '4': true,
              '5': true,
              '6': true,
            },
            bookableHolidays: [],
            bookingDaysRichText: ''
          }
        ],
        date
      );

      const textElement = fixture.debugElement.query(By.css('[data-testid="day-availability-text"]'));
      expect(textElement.nativeElement.textContent).toContain('Pass availability - Full');
    });

    it('should test the 12 hour time string function', () => {
      expect(component.to12hTimeString(11)).toBe("11am")
      expect(component.to12hTimeString(12)).toBe("12pm")
      expect(component.to12hTimeString(23)).toBe("11pm")
    })

    it('should test the submit function', () => {
      let emitSpy = spyOn(component.emitter, 'emit').and.callThrough();
      component.submit()

      expect(component.myForm.get('visitTime').value).toBeNull()
      expect(component.myForm.get('passType').value).toBe('')
      expect(component.myForm.get('passCount').value).toBe('')

      expect(emitSpy).toHaveBeenCalledTimes(1);
    })

    it('should test AM departure text', async () => {
      component.defaultAMOpeningHour = 7
      component.timeConfig.AM.offered = true;

      await fixture.detectChanges()

      const textElement = fixture.debugElement.query(By.css("#arrive-departure-text-AM"));

      expect(textElement.nativeElement.textContent).toContain('1pm (Depart by 1pm)');
      expect(component.to12hTimeString(component.defaultAMOpeningHour)).toBe(component.defaultAMOpeningHour.toString()+"am");
      expect(true).toBeTrue()
    })

    it('should test PM arrival text', () => {
      component.timeConfig.PM.offered = true;
      fixture.detectChanges()

      const textElement = fixture.debugElement.query(By.css("#arrive-departure-text-PM"));
      expect(textElement.nativeElement.textContent).toContain('Arrive after 1pm');
    })

    it('should test DAY arrival text', () => {
      component.timeConfig.DAY.offered = true;
      fixture.detectChanges()

      const textElement = fixture.debugElement.query(By.css("#arrive-departure-text-DAY"));
      expect(textElement.nativeElement.textContent).toContain('Arrive and depart within park operating hours.');
    })

  });
});
