import Ably from 'ably'
import wrtc from 'wrtc'
import {publish, subscribe} from '../ably'
import {serverSignalling} from '../signalling'
import {createWebrtcPeer} from '../webrtc'

export const createWebrtcConnection = (localId, dataTransform) => {
  const ably = new Ably.Realtime('xF2RJw.5T2wEg:AIGlaHQaqIMWPw_x')
  const sub = subscribe(ably, localId, 'signal')
  const pub = remoteId => publish(ably, remoteId, 'signal')

  return serverSignalling(localId, createWebrtcPeer(wrtc)(dataTransform))(sub)
    .subscribe(({remoteId, signal$}) => {
      console.log('Client connected', remoteId)
      return pub(remoteId)(signal$)
    })
}
