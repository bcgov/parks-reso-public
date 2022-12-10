import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Location } from "@angular/common";
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationComponent } from '../registration/registration.component';
import { ConfigService } from '../shared/services/config.service';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let imgtag: HTMLElement;
  let mockConfigService;
  let location: Location;

  beforeEach(async () => {

    mockConfigService = {
      config: {
        "ASSETS_S3_URL": "http://local-env/foo"
      }
    }

    await TestBed.configureTestingModule({
      declarations: [CardComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{ path: 'registration', component: RegistrationComponent }]
        )
      ],
      providers: [ {
        provide: ConfigService, useValue: mockConfigService
      }]
    }).compileComponents();
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.data = { "name": "Some Name", "sk": "SomeSK"};
    location = TestBed.inject(Location);
  });

  it('should create and set the alt tag', () => {
    fixture.detectChanges();
    imgtag = fixture.debugElement.nativeElement.querySelector('img');
    expect(component.altText).toBe(imgtag.getAttribute('alt'))
  });

  it('should show name on the H2 and show the URL properly', async () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('h2').innerHTML).toEqual('Some Name');
  });

  it('should navigate to registration page', fakeAsync(() => {
    component.navigate('park');
    tick(50)
    expect(location.path()).toBe("/registration");
  }));
});
