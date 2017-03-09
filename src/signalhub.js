import {Observable} from 'rxjs'

export const createChannel = (hub, name, dataTransform) => {
  const data$ = Observable.fromEvent(hub.subscribe(name), 'data')
  dataTransform(data$).subscribe(data => hub.broadcast(name, data))
}

// TODO: when the client disconnects (observable returned by signalTransform ends) it should create new client (rerun signalTransform)
export const webrtcSignals = (clientId, signalTransform) => signal$ => signal$
  .filter(({to}) => to === clientId)
  .groupBy(({from}) => from, ({signal}) => signal)
  .flatMap(inSignal$ =>
    signalTransform(inSignal$)
      .map(outSignal => ({from: clientId, to: inSignal$.key, signal: outSignal})))

export const webrtcSignalsClient = (clientId, serverId, signalTransform) => signal$ =>
  signalTransform(signal$
      .filter(({from, to}) => from === serverId && to === clientId)
      .map(({signal}) => signal))
    .map(signal => ({from: clientId, to: serverId, signal}))
