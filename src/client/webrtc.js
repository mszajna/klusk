import Ably from 'ably/browser/static/ably.js'
import uuid from 'uuid/v4'
import {createWebrtcPeer} from '../webrtc'
import {publish, subscribe} from '../ably'
import {clientSignalling} from '../signalling'

export const createWebrtcConnection = (remoteId, dataTransform) => {
  const ably = new Ably.Realtime('xF2RJw.5T2wEg:AIGlaHQaqIMWPw_x')
  const localId = uuid()
  const sub = subscribe(ably, localId, 'signal')
  const pub = publish(ably, remoteId, 'signal')

  return pub(clientSignalling(localId, remoteId, createWebrtcPeer(window, true)(dataTransform))(sub))
}
