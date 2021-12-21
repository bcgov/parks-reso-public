import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';

// payload returned from the server
@Injectable()
export class ServerPayload {
  nonce: string;
  captcha: string;
  validation: string;
  expiry: string;
}

@Injectable()
export class CaptchaDataService {
  public token: string;
  public isMS: boolean; // IE, Edge, etc

  apiPath: string;
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiPath = this.configService.config['API_LOCATION'] + this.configService.config['API_PUBLIC_PATH'];
    this.env = this.configService.config['ENVIRONMENT'];
  }

  getCaptcha(): Promise<any> {
    return this.http.post<any>(`${this.apiPath}/captcha`, null, {}).toPromise();
  }

  getCaptchaAudio(validation: any): Promise<any> {
    return this.http.post<any>(`${this.apiPath}/captcha/audio`, { validation }, {}).toPromise();
  }

  verifyCaptcha(validation: any, answer: string): Promise<any> {
    return this.http.post<any>(`${this.apiPath}/captcha/verify`, { validation, answer }, {}).toPromise();
  }
}
