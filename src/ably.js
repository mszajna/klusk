import {Subject} from 'rxjs'

export const subscribe = (ably, localId, event) => {
  const channel = ably.channels.get(localId)
  const subject = new Subject()
  channel.subscribe(event, ({data}) => subject.next(data))
  return subject
}

export const publish = (ably, remoteId, event) => message$ => {
  const channel = ably.channels.get(remoteId)
  message$.subscribe(message => channel.publish(event, message))
}
