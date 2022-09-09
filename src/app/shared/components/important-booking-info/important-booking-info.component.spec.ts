import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantBookingInfoComponent } from './important-booking-info.component';

describe('ImportantBookingInfoComponent', () => {
  let component: ImportantBookingInfoComponent;
  let fixture: ComponentFixture<ImportantBookingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportantBookingInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportantBookingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });
});
