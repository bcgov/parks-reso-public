import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FacilityService } from '../services/facility.service';

@Injectable()
export class FacilitiesResolverService  {
  constructor(private facilityService: FacilityService, private router: Router) {}

  resolve() {
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
