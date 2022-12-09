import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService {
  private configuration: any = {};

  constructor(
    private httpClient: HttpClient
  ) { }
  /**
   * Initialize the Config Service.  Get configuration data from front-end build, or back-end if nginx
   * is configured to pass the /config endpoint to a dynamic service that returns JSON.
   */
  async init() {
    // Initially set the configuration and see if we should be contacting our hostname endpoint for
    // any configuration data.
    this.configuration = window['__env'];

    const hashVersion = window['__env'].hashVersion;

    if (this.configuration['configEndpoint'] === true) {
      try {
        // Attempt to get application via this.httpClient. This uses the url of the application that you are running it from
        // This will not work for local because it will try and get localhost:4200/api instead of 3000/api...
        this.configuration = await this.httpClient.get(`/api/config`).toPromise();
      } catch (e) {
        // If all else fails, we'll just use the variables found in env.js
        console.error('Error getting local configuration:', e);
      }
    }

    // Override hash version as this comes from the buid.
    this.configuration['hashVersion'] = hashVersion;

    if (this.configuration['logLevel']) {
      console.log('Configuration:', this.configuration);
    }

    return Promise.resolve();
  }

  get config(): any {
    return this.configuration;
  }

  get logLevel(): any {
    // Can be overidden by the js console.
    if(window['__env'] && window['__env'].logLevel != undefined) {
      return window['__env'].logLevel;
    } else {
      return 0;
    }
  }
}
