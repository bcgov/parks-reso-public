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
import { PassLookupModule } from './pass-lookup/pass-lookup.module';
import { ParksListComponent } from './parks-list/parks-list.component';
import { ParksTableRowComponent } from './parks-list/parks-table-row/parks-table-row.component';
import { ParksListResolverService } from './parks-list/parks-list-resolver.service';
import { ConfigService } from './shared/services/config.service';
import { HttpClientModule } from '@angular/common/http';
import { LoggerService } from './services/logger.service';
import { ApiService } from './services/api.service';
import { EventService } from './services/event.service';
import { ParkService } from './services/park.service';
import { FacilitiesResolverService } from './registration/facilities-resolver.service';
import { ToastrModule } from 'ngx-toastr';
import { ToastService } from './services/toast.service';
import { TipsComponent } from './tips/tips.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ImportantBookingInfoModule } from './shared/components/important-booking-info/important-booking-info.module';
import { ListModule } from './shared/components/list/list.module';
import { Utils } from './shared/utils/utils';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

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
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    RegistrationModule,
    BrowserAnimationsModule,
    PassLookupModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center'
    }),
    FormsModule,
    ImportantBookingInfoModule,
    ListModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  exports: [CardComponent],
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
    ConfigService,
    Utils
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
