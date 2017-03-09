import {Observable} from 'rxjs'

export const createSocketIoChannel = requestTransform => socket => {
  const $data = Observable.fromEvent(socket, 'data')
  requestTransform($data).subscribe(data => socket.emit(data))
}
