import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from 'src/app/shared/services/config.service';
import { RegistrationDetailsComponent } from '../registration-details/registration-details.component';

import { SuccessComponent } from './success.component';

describe('SuccessComponent', () => {
  let component: SuccessComponent;
  let fixture: ComponentFixture<SuccessComponent>;
  let router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessComponent, RegistrationDetailsComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [ConfigService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', async () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create set the reg data to the park being passed in.', async () => {
    expect(component).toBeTruthy();
    // Set @Input
    component.regData = {
      'park': 'Some Park',
      'firstName': '',
      'lastName': '',
      'registrationNumber': '',
      'adminPassLink': 'http://127.0.0.1/link/to/nowhere'
    };
    component.park = 'Some Other Park';

    await fixture.isStable();
    await fixture.detectChanges();
    expect(component?.regData?.park).toEqual(component.park);

    const qrCodeElement = fixture.debugElement.query(By.css('.pb-3'));
    expect(qrCodeElement).toBeTruthy();

    let spyPrint = spyOn(component, 'print');
    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    await fixture.detectChanges();
    await fixture.isStable();
    expect(spyPrint).toHaveBeenCalled();
  });

  it('expect navigation to happen.', async () => {
    await fixture.isStable();
    const spy = spyOn(router, 'navigate').and.stub();
    component.navigate()
    expect(spy).toHaveBeenCalledTimes(1);
  })

  it('expect printing to execute', async () => {
    component.regData = {
      'park': 'Some Park',
      'firstName': '',
      'lastName': '',
      'registrationNumber': '',
      'adminPassLink': 'http://127.0.0.1/link/to/nowhere'
    };
    const windowMock = {
      document: {
        write(data) {
          return data;
        },
        close(data) {
          return data;
        }
      },
      focus() {
        return null;
      },
      print() {
        return null;
      }
    } as unknown as Window;
    let dummyElement = document.createElement('div');
    document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
    let spy = spyOn(window, 'open').and.returnValue(windowMock)
    let spy2 = spyOn(windowMock, 'focus');
    let spy3 = spyOn(windowMock, 'print');
    let spy4 = spyOn(windowMock.document, 'write');
    let spy5 = spyOn(windowMock.document, 'close');
    component.print();
    await fixture.detectChanges();
    await fixture.isStable();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(spy5).toHaveBeenCalled();
  })
});
