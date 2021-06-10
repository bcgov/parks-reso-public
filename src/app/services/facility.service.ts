import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { EventKeywords, EventObject, EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  private item: BehaviorSubject<any>;
  private list: BehaviorSubject<any>;

  constructor(
    private apiService: ApiService,
    private eventService: EventService
  ) {
    this.item = new BehaviorSubject(null);
    this.list = new BehaviorSubject(null);
  }

  setItemValue(value): void {
    this.item.next(value);
  }
  setListValue(value): void {
    this.list.next(value);
  }

  public getItemValue() {
    return this.item.asObservable();
  }
  public getListValue() {
    return this.list.asObservable();
  }

  async fetchData(facilitySk = null, parkSk = null) {
    let res = null;
    try {
      if (!facilitySk && parkSk) {
        // We are getting a facilities of a given park.
        res = await this.apiService.get('park', { park: parkSk, facilities: true });
        this.setListValue(res);
      } else if (facilitySk && parkSk) {
        // we're getting a single item for a given park
        res = await this.apiService.get('facility', { facilityName: facilitySk, park: parkSk });
        this.setItemValue(res[0]);
      } else {
        // We're getting a list
        res = await this.apiService.getList('facility');
        this.setListValue(res);
      }
    } catch (e) {
      console.log('ERROR', e);
      this.eventService.setError(
        new EventObject(
          EventKeywords.ERROR,
          e,
          'Park Service'
        )
      );
    }
  }

  clearItemValue(): void {
    this.setItemValue(null);
  }
  clearListValue(): void {
    this.setListValue(null);
  }
}
