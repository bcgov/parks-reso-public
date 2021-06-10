import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum EventKeywords {
  ERROR = 'err',
  INFO = 'info',
  DEBUG = 'debug'
}

export class EventObject {
  keyword: string; // error, info, debug
  message: string;
  eventSource: string;

  constructor(keyword?: EventKeywords, message?: string, eventSource?: string) {
    this.keyword = keyword || '';
    this.message = message || '';
    this.eventSource = eventSource || '';
  }
}

/*
Example:

this.eventService.setError(
  new EventObject(
    EventKeywords.ERROR,
    'No data was returned from the server.',
    'Import Service'
  )
);

*/

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private errorEvent: BehaviorSubject<EventObject>;
  private infoEvent: BehaviorSubject<EventObject>;
  private debugEvent: BehaviorSubject<EventObject>;

  constructor() {
    this.errorEvent = new BehaviorSubject<EventObject>(new EventObject());
    this.infoEvent = new BehaviorSubject<EventObject>(new EventObject());
    this.debugEvent = new BehaviorSubject<EventObject>(new EventObject());
  }

  setError(value: EventObject): void {
    this.errorEvent.next(value);
  }

  getError(): Observable<EventObject> {
    return this.errorEvent.asObservable();
  }

  setInfo(value: EventObject): void {
    this.infoEvent.next(value);
  }

  getInfo(): Observable<EventObject> {
    return this.infoEvent.asObservable();
  }

  setDebug(value: EventObject): void {
    this.debugEvent.next(value);
  }

  getDebug(): Observable<EventObject> {
    return this.debugEvent.asObservable();
  }
}
