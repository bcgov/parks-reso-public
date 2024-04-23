import { Injectable } from '@angular/core';

import { ParkService } from '../services/park.service';

@Injectable()
export class ParksListResolverService  {
  constructor(
    private parkService: ParkService
  ) { }

  resolve() {
    this.parkService.clearListValue();
    this.parkService.fetchData();
  }
}
