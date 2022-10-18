import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../shared/services/config.service';
import { SwUpdate } from '@angular/service-worker';
import { ToastService } from './toast.service';
import { Constants } from '../shared/utils/constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public token: string;
  public isMS: boolean; // IE, Edge, etc

  apiPath: string;
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(
    readonly updates: SwUpdate,
    private toastService: ToastService,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiPath = this.configService.config['API_LOCATION'] + this.configService.config['API_PUBLIC_PATH'];
    this.env = this.configService.config['ENVIRONMENT'];

    console.log(`Update checking enabled? (${updates.isEnabled})`);

    updates.versionUpdates.subscribe(evt => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          this.toastService.addMessage(
            `Please reload your browser, there is an update available.`,
            `Update detected`,
            Constants.ToastTypes.INFO
          );

          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
        case 'NO_NEW_VERSION_DETECTED':
          console.log('No new version detected.')
      }
    });
  }

  post(endpoint, obj, queryParamsObject = null): Promise<any> {
    let queryString = this.generateQueryString(queryParamsObject);
    return this.http.post<any>(`${this.apiPath}/${endpoint}?${queryString}`, obj, {}).toPromise();
  }

  get(endpoint, queryParamsObject = null): Promise<any> {
    let queryString = this.generateQueryString(queryParamsObject);
    return this.http.get<any>(`${this.apiPath}/${endpoint}?${queryString}`, {}).toPromise();
  }

  delete(endpoint, queryParamsObject = null): Promise<any> {
    let queryString = this.generateQueryString(queryParamsObject);
    return this.http.delete<any>(`${this.apiPath}/${endpoint}?${queryString}`, {}).toPromise();
  }

  getList(endpoint): Promise<any> {
    return this.http.get<any>(`${this.apiPath}/${endpoint}`, {}).toPromise();
  }

  private generateQueryString(queryParamsObject) {
    let queryString = '';
    if (queryParamsObject) {
      for (let key of Object.keys(queryParamsObject)) {
        queryString += `&${key}=${queryParamsObject[key]}`;
      }
      queryString = queryString.substring(1);
    }
    return queryString;
  }
}
