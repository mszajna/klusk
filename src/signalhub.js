import {Observable} from 'rxjs'

export const subscribe = (hub, channel) =>
  Observable.fromEvent(hub.subscribe(channel), 'data')

export const publish = (hub, channel) => message$ => {
  message$.subscribe(message => hub.broadcast(channel, message))
}
