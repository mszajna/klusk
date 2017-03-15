import signalhub from 'signalhub'
import uuid from 'uuid/v4'
import Peer from 'simple-peer'
import {createSimplePeer} from '../simplePeer'
import {publish, subscribe} from '../signalhub'
import {clientSignalling} from '../signalling'

const hub = signalhub('my-app', ['http://localhost:3001'])
const localId = uuid()
const remoteId = 'server'
const sub = subscribe(hub, localId)
const pub = publish(hub, remoteId)

export const createWebrtcConnection = dataTransform =>
  pub(clientSignalling(localId, remoteId, createSimplePeer(() => new Peer({initiator: true, objectMode: true}))(dataTransform))(sub))
