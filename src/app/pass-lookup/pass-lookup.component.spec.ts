import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '../shared/services/config.service';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';

import { PassLookupComponent } from './pass-lookup.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PassLookupComponent', () => {
  let component: PassLookupComponent;
  let fixture: ComponentFixture<PassLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PassLookupComponent],
    imports: [RouterTestingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })],
    providers: [ConfigService, SwUpdate, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
