import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export class CacheableObservable<T> {
  private readonly lifetimeOfCache: number;
  private readonly observable: Observable<T>;

  private cache?: Observable<T>;
  private timeRequested?: Date;

  constructor(observable: Observable<T>, lifetimeOfCache: number = 1000 * 60 * 60) {
    this.observable = observable;
    this.lifetimeOfCache = lifetimeOfCache;
  }

  public runObs(): Observable<T> {
    if (!this.cache || (this.timeRequested) && (new Date().getTime() - this.timeRequested.getTime()) > this.lifetimeOfCache) {
      this.timeRequested = new Date();
      this.cache = this.observable.pipe(shareReplay());
    }

    return this.cache;
  }

}
