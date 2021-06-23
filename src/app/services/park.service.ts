import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Constants } from '../shared/utils/constants';
import { ApiService } from './api.service';
import { EventKeywords, EventObject, EventService } from './event.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class ParkService {
  private item: BehaviorSubject<any>;
  private list: BehaviorSubject<any>;

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
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

  async fetchData(sk = null) {
    let res = null;
    let errorSubject = '';
    try {
      if (sk) {
        // we're getting a single item
        errorSubject = 'park';
        res = await this.apiService.get('park', { park: sk });
        // TODO: checks before sending back item.
        this.setItemValue(res[0]);
      } else {
        // We're getting a list
        errorSubject = 'parks';
        res = await this.apiService.getList('park');
        this.setListValue(res);
      }
    } catch (e) {
      this.toastService.addMessage(`Please refresh the page.`, `Error getting ${errorSubject}`, Constants.ToastTypes.ERROR);
      this.eventService.setError(
        new EventObject(
          EventKeywords.ERROR,
          e,
          'Park Service'
        )
      );
      if (errorSubject === 'parks') {
        this.setListValue('error');
      } else {
        this.setItemValue('error');
      }
    }
  }

  clearItemValue(): void {
    this.setItemValue(null);
  }
  clearListValue(): void {
    this.setListValue(null);
  }
}
