import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { firstValueFrom } from 'rxjs';

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

  getCaptcha(facility: string, orcs: string, bookingDate: string, passType: string): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.apiPath}/captcha`, { facility, orcs, bookingDate, passType }, {}));
  }

  getCaptchaAudio(validation: any): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.apiPath}/captcha/audio`, { validation }, {}));
  }

  verifyCaptcha(validation: any, answer: string): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.apiPath}/captcha/verify`, { validation, answer }, {}));
  }
}
