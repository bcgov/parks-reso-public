import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApplicationRef, Injectable } from '@angular/core';
import { ConfigService } from '../shared/services/config.service';
import { SwUpdate } from '@angular/service-worker';
import { ToastService } from './toast.service';
import { Constants } from '../shared/utils/constants';
import { LoggerService } from './logger.service';
import { concat, first, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public token: string;
  public isMS: boolean; // IE, Edge, etc

  apiPath: string;
  env: 'local' | 'dev' | 'test' | 'prod';
  headers: HttpHeaders;

  constructor(
    appRef: ApplicationRef,
    readonly updates: SwUpdate,
    private toastService: ToastService,
    private http: HttpClient,
    private loggerService: LoggerService,
    private configService: ConfigService
  ) {
    this.apiPath = this.configService.config['API_LOCATION'] + this.configService.config['API_PUBLIC_PATH'];
    this.env = this.configService.config['ENVIRONMENT'];
    this.headers = new HttpHeaders().set('X-App-Version', this.configService.config.hashVersion);

    this.loggerService.info(`Update checking enabled? (${updates.isEnabled})`);

    updates.versionUpdates.subscribe(evt => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          this.loggerService.info(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          this.loggerService.info(`Current app version: ${evt.currentVersion.hash}`);
          this.loggerService.info(`New app version ready for use: ${evt.latestVersion.hash}`);
          this.toastService.addMessage(
            `Please reload your browser, there is an update available.`,
            `Update detected`,
            Constants.ToastTypes.INFO
          );

          break;
        case 'VERSION_INSTALLATION_FAILED':
          this.loggerService.info(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
        case 'NO_NEW_VERSION_DETECTED':
          this.loggerService.info('No new version detected.')
      }
    });

    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      this.loggerService.info("Checking for update")
      try {
        const bUpdateFound = await updates.checkForUpdate();
        this.loggerService.info(`Update Found?:${bUpdateFound}`)

        if (bUpdateFound) {
          this.toastService.addMessage(
            `Please reload your browser, there is an update available.`,
            `Update detected`,
            Constants.ToastTypes.INFO
          );
        }
      } catch (e) {
        this.loggerService.error(e);
      }
    });
  }

  post(endpoint, obj, queryParamsObject = null): Promise<any> {
    let queryString = this.generateQueryString(queryParamsObject);
    return this.http.post<any>(`${this.apiPath}/${endpoint}?${queryString}`, obj, {}).toPromise();
  }

  get(endpoint, queryParamsObject = null): Promise<any> {
    let queryString = this.generateQueryString(queryParamsObject);
    return this.http.get<any>(`${this.apiPath}/${endpoint}?${queryString}`, { headers: this.headers }).toPromise();
  }

  delete(endpoint, queryParamsObject = null): Promise<any> {
    let queryString = this.generateQueryString(queryParamsObject);
    return this.http.delete<any>(`${this.apiPath}/${endpoint}?${queryString}`, { headers: this.headers }).toPromise();
  }

  getList(endpoint): Promise<any> {
    return this.http.get<any>(`${this.apiPath}/${endpoint}`, { headers: this.headers }).toPromise();
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
