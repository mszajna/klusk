import {Observable} from 'rxjs'
/* global JSON */

export const createSimplePeer = peerFactory => requestTransform => inSignal$ => {
  const peer = peerFactory()
  const close$ = Observable.fromEvent(peer, 'close')
  const data$ = Observable.fromEvent(peer, 'data')
  const outSignal$ = Observable.fromEvent(peer, 'signal')
  const connect$ = Observable.fromEvent(peer, 'connect')

  inSignal$.takeUntil(close$).subscribe(signal => peer.signal(signal))
  const {data$: outData$} = requestTransform({data$: data$.map(JSON.parse), connect$, disconnect$: close$})
  outData$.map(JSON.stringify).skipUntil(connect$).takeUntil(close$).subscribe(response => peer.send(response))

  return outSignal$.takeUntil(close$)
}
