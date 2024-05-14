import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '../shared/services/config.service';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { ParkDetailsComponent } from './park-details/park-details.component';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';

import { RegistrationComponent } from './registration.component';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrationComponent, ParkDetailsComponent, GuidelinesComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })
      ],
      providers: [ConfigService, SwUpdate]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should deactivate when time is not expired and state is contact-form', () => {
    // Arrange
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    component.timeExpired = false;
    component.state = 'contact-form';

    // Act
    const result = component.canDeactivate();

    // Assert
    expect(confirmSpy).toHaveBeenCalledWith('"If you leave this page, you will lose any passes currently being held for you. Are you sure you want to leave?"');
    expect(result).toBe(true);
  });
});