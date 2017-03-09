import signalhub from 'signalhub'
import wrtc from 'wrtc'
import Peer from 'simple-peer'

const hub = signalhub('my-app', ['http://localhost:3001'])
const channelId = 'test'
const clientId = 'server'

import {createChannel, webrtcSignals} from '../signalhub'
import {createSimplePeer} from '../simplePeer'
import {createDirectoryWatcher} from './file/watch'
import {open, save} from './file/rw'
import {merge, log} from '../observables'

const dataTransform = log(merge(createDirectoryWatcher('ignore'), open('ignore'), save('ignore')))

createChannel(hub, channelId, webrtcSignals(clientId, createSimplePeer(() => new Peer({wrtc, objectMode: true}))(dataTransform)))
