import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigService } from 'src/app/shared/services/config.service';
import { RegistrationModule } from '../registration.module';
import { By } from '@angular/platform-browser';

import { ParkDetailsComponent } from './park-details.component';

describe('ParkDetailsComponent', () => {
  let component: ParkDetailsComponent;
  let fixture: ComponentFixture<ParkDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParkDetailsComponent],
      imports: [RegistrationModule],
      providers: [
        ConfigService,
        HttpClient,
        HttpHandler
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //Test the for video link to load when if criteria is met
  it('should display the video link when park has videoLink', () => {
    component.park = { videoLink: 'https://example.com' };
    fixture.detectChanges();

    const videoLink = fixture.debugElement.query(By.css('.btn.btn-primary.p-3.w-100.justify-content-between.parking-button'));
    expect(videoLink).toBeTruthy();
  });
  //Test for the video link to not appear when there is no data for it.
  it('should not display the video link when park does not have videoLink', () => {
    fixture.detectChanges();

    const videoLink = fixture.debugElement.query(By.css('.btn.btn-primary.p-3.w-100.justify-content-between.parking-button'));
    expect(videoLink).toBeFalsy();
  });
  //Test for the parking map to appear when if criteria is met
  it('should display the Parking Map when park has mapLink', () => {
    component.park = { mapLink: 'https://example.com' };
    fixture.detectChanges();

    const mapLink = fixture.debugElement.query(By.css('.btn.btn-primary.p-3.w-100.justify-content-between.parking-button'));
    expect(mapLink).toBeTruthy();
  });
  //Test for the parking map  to not appear when there is no data
  it('should not display the Parking map when park does not have mapLink', () => {
    fixture.detectChanges();

    const mapLink = fixture.debugElement.query(By.css('.btn.btn-primary.p-3.w-100.justify-content-between.parking-button'));
    expect(mapLink).toBeFalsy();
  });
});
