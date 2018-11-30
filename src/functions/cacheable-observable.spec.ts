import { CacheableObservable } from './cacheable-observable';
import { of } from 'rxjs';
import { install } from 'lolex';

describe('CacheableObservable', () => {
  it('should initialize cache', () => {
    const observable = of([1, 2]);
    const spy = spyOn(observable, 'subscribe');
    // noinspection JSUnusedLocalSymbols
    const cacheableObservable = new CacheableObservable(observable);
    expect(spy).toHaveBeenCalled();
  });

  it('should not initialize cache if set ', () => {
    const observable = of([1, 2]);
    const spy = spyOn(observable, 'subscribe');
    // noinspection JSUnusedLocalSymbols
    const cacheableObservable = new CacheableObservable(observable, 1000, false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not call multiple times if cache alive', () => {
    const observable = of([1, 2]);
    const spy = spyOn(observable, 'subscribe');
    const cacheableObservable = new CacheableObservable(observable);
    cacheableObservable.runObs().subscribe();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call again if cache busted', () => {
    const observable = of([1, 2]);
    const spy = spyOn(observable, 'subscribe');
    const cacheableObservable = new CacheableObservable(observable);
    cacheableObservable.runObs().subscribe();
    cacheableObservable.bustCache();
    cacheableObservable.runObs().subscribe();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should call again if cache lifetime up', () => {
    const clock = install();
    const observable = of([1, 2]);
    const spy = spyOn(observable, 'subscribe');
    const cacheableObservable = new CacheableObservable(observable, 1000);
    cacheableObservable.runObs().subscribe();
    clock.tick(500);
    cacheableObservable.runObs().subscribe();
    clock.tick(1000);
    cacheableObservable.runObs().subscribe();

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
