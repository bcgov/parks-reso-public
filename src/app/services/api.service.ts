import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ConfigService } from '../shared/services/config.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public token: string;
  public isMS: boolean; // IE, Edge, etc

  apiPath: string;
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private logger: LoggerService
  ) {
    this.apiPath = this.configService.config['API_LOCATION']
      + this.configService.config['API_PUBLIC_PATH'];
    this.env = this.configService.config['ENVIRONMENT'];
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
