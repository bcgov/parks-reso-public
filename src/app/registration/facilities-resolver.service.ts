import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { FacilityService } from '../services/facility.service';

@Injectable()
export class FacilitiesResolverService implements Resolve<void> {
  constructor(
    private facilityService: FacilityService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    if (
      !this.router.getCurrentNavigation() ||
      !this.router.getCurrentNavigation().extras ||
      !this.router.getCurrentNavigation().extras.state
    ) {
      this.router.navigate(['']);
    } else {
      const park = this.router.getCurrentNavigation().extras.state.park;
      this.facilityService.clearListValue();
      this.facilityService.fetchData(null, park.sk);
    }
  }
}
