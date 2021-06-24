import { Injectable } from '@angular/core';
import { PostPass } from '../models/pass';
import { Constants } from '../shared/utils/constants';
import { ApiService } from './api.service';
import { EventKeywords, EventObject, EventService } from './event.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PassService {
  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private toastService: ToastService
  ) {
  }

  // example obj:
  // {
  //   "numberOfGuests": 2,
  //   "lastName": "joe",
  //   "facilityName": "Facility A",
  //   "email": "fresh@gmail.com",
  //   "firstName": "fresh",
  //   "date": new Date('2021-06-10T16:18:46.758Z'),
  //   "type": "AM",
  //   "parkName": "Rathtrevor",
  //   "phoneNumber": 1234567890,
  //   "facilityType": "Trail",
  //   "license": null
  // }

  async createPass(obj, parkSk, facilitySk) {
    let res = null;
    try {
      // Remove non-valid fields and verify field types.
      this.checkManditoryFields(obj);
      if (parkSk === '' || !parkSk) {
        throw ('You must provide a park sk');
      }
      if (facilitySk === '' || !facilitySk) {
        throw ('You must provide a facility sk');
      }
      let postObj = new PostPass(obj);
      postObj.parkName = parkSk;
      postObj.facilityName = facilitySk;
      res = await this.apiService.post('pass', postObj);
    } catch (e) {
      this.toastService.addMessage(`Please try reserving again.`, `Error`, Constants.ToastTypes.ERROR);
      this.eventService.setError(
        new EventObject(
          EventKeywords.ERROR,
          e,
          'Park Service'
        )
      );
      throw e;
    }
    return res;
  }

  // example obj - GET pass (will send cancellation email):
  // {
  //   "email": "fresh@gmail.com",
  //   "passId": "12345657890",
  //   "park": "Rathtrevor",
  // }

  async getPassToCancel(obj) {
    let res = null;
    try {
      if (obj.code || obj.code === '') {
        delete obj.code;
      }
      this.checkPassToCancel(obj);
      res = await this.apiService.get('pass', obj);
    } catch (e) {
      console.log('ERROR: ', e);
      this.eventService.setError(
        new EventObject(
          EventKeywords.ERROR,
          e,
          'Pass Service'
        )
      );
      throw e;
    }
    return res;
  }

  // example obj - DELETE pass (will set pass status to cancelled):
  // {
  //   "park": "Rathtrevor",
  //   "passId": "1234567890",
  //   "code": *JWT token*,
  // }

  async cancelPass(obj) {
    let res = null;
    try {
      this.checkCancelPass(obj);
      res = await this.apiService.delete('pass', obj);
    } catch (e) {
      console.log('ERROR: ', e);
      this.eventService.setError(
        new EventObject(
          EventKeywords.ERROR,
          e,
          'Pass Service'
        )
      );
      throw e;
    }
    return res;
  }

  private checkPassToCancel(obj) {
    if (!obj.email) {
      throw ('You must provide a pass email');
    }
    if (!obj.passId) {
      throw ('You must provide a passId');
    }
    if (obj.park === '' || !obj.park) {
      throw ('You must provide a park sk');
    }
  }

  private checkCancelPass(obj) {
    if (!obj.passId) {
      throw ('You must provide a passId');
    }
    if (!obj.park) {
      throw ('You must provide a park sk');
    }
    if (!obj.code || obj.code === '') {
      throw ('You must provide a cancellation token');
    }
  }

  private checkManditoryFields(obj) {
    if (!obj.date) {
      throw ('You must provide a pass date');
    }
    if (obj.email === '' || !obj.email) {
      throw ('You must provide a pass email');
    }
    if (obj.firstName === '' || !obj.firstName) {
      throw ('You must provide a pass firstName');
    }
    if (obj.lastName === '' || !obj.lastName) {
      throw ('You must provide a pass lastName');
    }
    if (obj.numberOfGuests === '' || !obj.numberOfGuests) {
      throw ('You must provide a pass numberOfGuests');
    }
    if (obj.type === '' || !obj.type) {
      throw ('You must provide a pass type');
    }
    if (obj.facilityType === '' || !obj.facilityType) {
      throw ('You must provide a pass facility type');
    }
    if (obj.facilityType === 'Parking') {
      // If the facility is a parking lot than we have to collect license.
      if (obj.license === '' || !obj.license) {
        throw ('You must provide a pass license');
      }
    }
  }
}
