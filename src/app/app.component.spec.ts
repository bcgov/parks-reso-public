import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { RegistrationModule } from './registration/registration.module';
import { LoggerService } from './services/logger.service';
import { ImportantBookingInfoModule } from './shared/components/important-booking-info/important-booking-info.module';
import { TableTemplateModule } from './shared/components/table-template/table-template.module';
import { ConfigService } from './shared/services/config.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        RegistrationModule,
        HttpClientTestingModule,
        ImportantBookingInfoModule,
        TableTemplateModule,
        ToastrModule.forRoot()
      ],
      declarations: [
        AppComponent, HeaderComponent, FooterComponent
      ],
      providers: [ConfigService, LoggerService]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
