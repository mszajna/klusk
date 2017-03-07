import signalhub from 'signalhub';
import wrtc from 'wrtc';
import Peer from 'simple-peer';
import {createDirectoryWatcher} from './file/watch';

const hub = signalhub('my-app', ['http://localhost:3001']);
const channelId = 'test';
const clientId = 'server';

import {createChannel, webrtcSignals} from '../signalhub';
import {createSimplePeer} from '../simplePeer';

const dataTransform = createDirectoryWatcher('ignore');

createChannel(hub, channelId, webrtcSignals(clientId, createSimplePeer(() => new Peer({wrtc, objectMode: true}))(dataTransform)));
