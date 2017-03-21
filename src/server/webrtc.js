import Ably from 'ably'
import wrtc from 'wrtc'
import Peer from 'simple-peer'
import {publish, subscribe} from '../ably'
import {serverSignalling} from '../signalling'
import {createSimplePeer} from '../simplePeer'

export const createWebrtcConnection = (localId, dataTransform) => {
  const ably = new Ably.Realtime('xF2RJw.5T2wEg:AIGlaHQaqIMWPw_x')
  const sub = subscribe(ably, localId, 'signal')
  const pub = remoteId => publish(ably, remoteId, 'signal')

  return serverSignalling(localId, createSimplePeer(() => new Peer({wrtc, objectMode: true}))(dataTransform))(sub)
    .subscribe(({remoteId, signal$}) => {
      console.log('Client connected', remoteId)
      return pub(remoteId)(signal$)
    })
}
