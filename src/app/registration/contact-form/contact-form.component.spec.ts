import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactFormComponent } from './contact-form.component';
import { ConfigService } from 'src/app/shared/services/config.service';
import { UntypedFormBuilder } from '@angular/forms';
import { fakeAsync } from '@angular/core/testing';
import { RegistrationModule } from '../registration.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [],
    imports: [RegistrationModule],
    providers: [ConfigService, UntypedFormBuilder, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    component.passData = {
      passType: {
        name: 'Test Name',
        type: 'Trail'
      }
    };
    component.park = {
      orcs: '0001'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('Phone number value reset after uncheck', () => {
    const enablePhoneCheckbox = component.myForm.get('enablePhone');
    const phoneControl = component.myForm.get('phone');
    enablePhoneCheckbox.setValue(true);
    fixture.detectChanges();
    const testPhoneNumber = '250-555-5555';
    phoneControl.setValue(testPhoneNumber);
    fixture.detectChanges();
    enablePhoneCheckbox.setValue(false);
    fixture.detectChanges();
    expect(phoneControl.value).toEqual('');
  });


  it('should not allow phone number without to be over 12 characters', fakeAsync(() => {
    const enablePhoneCheckbox = component.myForm.get('enablePhone');
    const phoneFormControl = component.myForm.get('phone');
    const phoneInput = fixture.nativeElement.querySelector('#phone');
  
    enablePhoneCheckbox.setValue(true);
    fixture.detectChanges();
  
    const testPhoneNumber = '250-555-11111111115555';
    phoneInput.value = testPhoneNumber;
  
    const keyEvent = new KeyboardEvent('keydown', {
      key: '1'
    });
  
    phoneInput.dispatchEvent(keyEvent);
    fixture.detectChanges();
  
    expect(phoneFormControl.hasError('invalidPhoneNumber')).toBeTruthy();
  }));
});
