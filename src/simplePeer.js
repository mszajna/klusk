import {Observable} from 'rxjs';
import json from './json';
/* global JSON */

export const createSimplePeer = peerFactory => requestTransform => inSignal$ => {
  const peer = peerFactory();
  const close$ = Observable.fromEvent(peer, 'close');
  const data$ = Observable.fromEvent(peer, 'data');
  const outSignal$ = Observable.fromEvent(peer, 'signal');
  const connect$ = Observable.fromEvent(peer, 'connect');
  const error$ = Observable.fromEvent(peer, 'error');

  close$.subscribe(() => console.log('close'));
  connect$.subscribe(() => console.log('connect'));
  error$.subscribe((error) => console.log('error', error));


  inSignal$.takeUntil(close$).subscribe(signal => peer.signal(signal));
  connect$.subscribe(() => {
    json(requestTransform)(data$).takeUntil(close$).subscribe(response => peer.send(response));
  });

  return outSignal$.takeUntil(close$);
};
