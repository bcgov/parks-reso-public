import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { CaptchaDataService } from './captcha-data.service';

import { CaptchaComponent } from './captcha.component';

describe('CaptchaComponent', () => {
  let component: CaptchaComponent;
  let fixture: ComponentFixture<CaptchaComponent>;
  let captchaServiceSpy: jasmine.SpyObj<CaptchaDataService>;

  beforeEach(async () => {
    captchaServiceSpy = jasmine.createSpyObj('CaptchaDataService', ['getCaptcha', 'verifyCaptcha']);

    await TestBed.configureTestingModule({
      declarations: [CaptchaComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [ConfigService, { provide: CaptchaDataService, useValue: captchaServiceSpy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should present the captcha input when getCaptcha() succeeds', async () => {
    const getCaptchaSpy = captchaServiceSpy.getCaptcha.and.returnValue(Promise.resolve({}));
    const captchaElement: HTMLElement = fixture.nativeElement;

    await component.ngOnInit();
    fixture.detectChanges();

    const input = captchaElement.querySelector('input');

    expect(component).toBeTruthy();
    expect(getCaptchaSpy.calls.any()).toBe(true);
    expect(component.state).toBe('ready');
    expect(input).toBeTruthy();
  });

  it('should display error when getCaptcha() fails', async () => {
    const getCaptchaSpy = captchaServiceSpy.getCaptcha.and.returnValue(Promise.reject({}));
    const captchaElement: HTMLElement = fixture.nativeElement;

    await component.ngOnInit();
    fixture.detectChanges();

    const errorContainer = captchaElement.querySelector('.error-container');

    expect(component).toBeTruthy();
    expect(getCaptchaSpy.calls.any()).toBe(true);
    expect(component.state).toBe('error');
    expect(errorContainer).toBeTruthy();
  });

  it('should display success when captcha is verified', async () => {
    const getCaptchaSpy = captchaServiceSpy.getCaptcha.and.returnValue(Promise.resolve({}));
    const verifyCaptchaSpy = captchaServiceSpy.verifyCaptcha.and.returnValue(Promise.resolve({ valid: true }));
    const captchaElement: HTMLElement = fixture.nativeElement;

    await component.ngOnInit();

    component.answer = '123abc';
    await component.answerChanged();
    fixture.detectChanges();

    const validContainer = captchaElement.querySelector('.captcha-valid');

    expect(component).toBeTruthy();
    expect(getCaptchaSpy.calls.any()).toBe(true);
    expect(verifyCaptchaSpy.calls.any()).toBe(true);
    expect(component.state).toBe('valid');
    expect(validContainer).toBeTruthy();
  });
});
