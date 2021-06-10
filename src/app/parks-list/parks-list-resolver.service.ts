import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ParkService } from '../services/park.service';

@Injectable()
export class ParksListResolverService implements Resolve<void> {
  constructor(
    private parkService: ParkService
  ) { }

  resolve() {
    this.parkService.clearListValue();
    this.parkService.fetchData();
  }
}
