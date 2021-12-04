import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { CardComponent } from './card/card.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { RegistrationModule } from './registration/registration.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { PassLookupModule } from './pass-lookup/pass-lookup.module';
import { ParksListComponent } from './parks-list/parks-list.component';
import { ParksTableRowComponent } from './parks-list/parks-table-row/parks-table-row.component';
import { ParksListResolverService } from './parks-list/parks-list-resolver.service';
import { ConfigService } from './services/config.service';
import { HttpClientModule } from '@angular/common/http';
import { LoggerService } from './services/logger.service';
import { ApiService } from './services/api.service';
import { EventService } from './services/event.service';
import { ParkService } from './services/park.service';
import { FacilitiesResolverService } from './registration/facilities-resolver.service';
import { ToastrModule } from 'ngx-toastr';
import { ToastService } from './services/toast.service';
import { CaptchaDataService } from './services/captcha-data.service';
import { TipsComponent } from './tips/tips.component';

export function initConfig(configService: ConfigService) {
  return async () => {
    await configService.init();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    CardComponent,
    BreadcrumbComponent,
    ParksListComponent,
    ParksTableRowComponent,
    TipsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    RegistrationModule,
    BrowserAnimationsModule,
    SharedModule,
    PassLookupModule,
    ToastrModule.forRoot(
      {
        positionClass: 'toast-top-center'
      }
    ),
    FormsModule
  ],
  exports: [
    CardComponent
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [ConfigService],
      multi: true
    },
    ParksListResolverService,
    ConfigService,
    LoggerService,
    ApiService,
    EventService,
    ParkService,
    FacilitiesResolverService,
    ToastService,
    CaptchaDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
