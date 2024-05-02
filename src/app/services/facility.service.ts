import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Constants } from '../shared/utils/constants';
import { ApiService } from './api.service';
import { EventKeywords, EventObject, EventService } from './event.service';
import { LoggerService } from './logger.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  private item: BehaviorSubject<any>;
  private list: BehaviorSubject<any>;

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private loggerService: LoggerService,
    private toastService: ToastService
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
    let errorSubject = '';
    try {
      if (!facilitySk && parkSk) {
        // We are getting a facilities of a given park.
        errorSubject = 'facilities';
        this.loggerService.debug(`Facility GET: ${parkSk}`);
        res = await this.apiService.get('facility', { park: parkSk, facilities: true });
        this.setListValue(res);
      } else if (facilitySk && parkSk) {
        errorSubject = 'facility';
        // we're getting a single item for a given park
        this.loggerService.debug(`Facility GET: ${parkSk} ${facilitySk}`);
        res = await this.apiService.get('facility', { facilityName: facilitySk, park: parkSk });
        this.setItemValue(res[0]);
      } else {
        // We're getting a list
        errorSubject = 'facilities';
        this.loggerService.debug(`Facility List GET:`);
        res = await this.apiService.getList('facility');
        this.setListValue(res);
      }
      //get reservations
      await this.fetchReservationData(res);
    } catch (e) {
      this.loggerService.error(`${e}`);
      this.toastService.addMessage(
        `Please refresh the page.`,
        `Error getting ${errorSubject}`,
        Constants.ToastTypes.ERROR
      );
      this.eventService.setError(new EventObject(EventKeywords.ERROR, e, 'Park Service'));
      if (errorSubject === 'facilities') {
        this.setListValue('error');
      } else {
        this.setItemValue('error');
      }
    }
  }

  async fetchReservationData(facilities) {
    for (let facility of facilities) {
      let reservationRes;
      try {
        this.loggerService.debug(`Reservation GET: ${facility.name} ${facility.pk.substring(facility.pk.indexOf('::') + 2)}`);
        reservationRes = await this.apiService.get('reservation', {
          facility: facility.name,
          park: facility.pk.substring(facility.pk.indexOf('::') + 2)
        });
      } catch (error) {
        this.loggerService.debug(`${error}`);
        throw 'An error has occurred, please try again.';
      }
      facility.reservations = reservationRes;
    }
    return facilities;
  }

  clearItemValue(): void {
    this.setItemValue(null);
  }
  clearListValue(): void {
    this.setListValue(null);
  }
}
