import signalhub from 'signalhub'
import uuid from 'uuid/v4'
import Peer from 'simple-peer'
import {createSimplePeer} from '../simplePeer'
import {createChannel, webrtcSignalsClient} from '../signalhub'

const hub = signalhub('my-app', ['http://localhost:3001'])
const channelId = 'test'
const clientId = uuid()
const serverId = 'server'

export const createWebrtcConnection = dataTransform =>
  createChannel(hub, channelId, webrtcSignalsClient(clientId, serverId, createSimplePeer(() => new Peer({initiator: true, objectMode: true}))(dataTransform)))
