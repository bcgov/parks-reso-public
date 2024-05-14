import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ParksListResolverService } from './parks-list/parks-list-resolver.service';
import { PassLookupComponent } from './pass-lookup/pass-lookup.component';
import { FacilitiesResolverService } from './registration/facilities-resolver.service';
import { RegistrationComponent } from './registration/registration.component';
import { FaqComponent } from './faq/faq.component'

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: [
      ParksListResolverService
    ]
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    resolve: [
      FacilitiesResolverService
    ]
  },
  {
    path: 'pass-lookup',
    component: PassLookupComponent,
  }, 
  {
    path: 'faq',
    component: FaqComponent,
  },
  {
    path: '**', pathMatch: 'full',
    component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
