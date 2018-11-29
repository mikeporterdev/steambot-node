import { RxHR } from '@akanass/rx-http-request';
import { Observable } from 'rxjs';

export class Http {
  private _RxHR: any;

  constructor() {
    this._RxHR = RxHR;
  }

  public get(url: string): Observable<any> {
    console.log(`Requesting ${url}`);
    return RxHR.get(url, { json: true });
  }
}
