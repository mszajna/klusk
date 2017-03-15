import signalhub from 'signalhub'
import wrtc from 'wrtc'
import Peer from 'simple-peer'
import {publish, subscribe} from '../signalhub'
import {serverSignalling} from '../signalling'
import {createSimplePeer} from '../simplePeer'

const hub = signalhub('my-app', ['http://localhost:3001'])
const localId = 'server'
const sub = subscribe(hub, localId)
const pub = remoteId => publish(hub, remoteId)

export const createWebrtcConnection = dataTransform =>
  serverSignalling(localId, createSimplePeer(() => new Peer({wrtc, objectMode: true}))(dataTransform))(sub)
    .subscribe(({remoteId, signal$}) => pub(remoteId)(signal$))
