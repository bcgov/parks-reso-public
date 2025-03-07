import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ParksListComponent } from '../parks-list/parks-list.component';
import { ApiService } from '../services/api.service';
import { ParkService } from '../services/park.service';
import { ImportantBookingInfoComponent } from '../shared/components/important-booking-info/important-booking-info.component';
import { ConfigService } from '../shared/services/config.service';
import { TipsComponent } from '../tips/tips.component';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { HomeComponent } from './home.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [HomeComponent, ImportantBookingInfoComponent, ParksListComponent, TipsComponent],
    imports: [RouterTestingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })],
    providers: [ParkService, ApiService, ConfigService, SwUpdate, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
