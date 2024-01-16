import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { EventKeywords, EventObject, EventService } from './event.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private loggerService: LoggerService
  ) {
  }

  async getFaq() {
    let res = null;
    try {
      this.loggerService.debug(`GETTING FAQ: }`);
      res = await this.apiService.get('readfaq', { faq: 'faq' });
      console.log(JSON.stringify(res))
    } catch (e) {
      this.loggerService.error(`${e}`);
      this.eventService.setError(
        new EventObject(
          EventKeywords.ERROR,
          e,
          'Pass Service'
        )
      );
      throw e;
    }
    return res[0].text;
  }

}
