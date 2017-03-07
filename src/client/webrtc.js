import signalhub from 'signalhub';
import uuid from 'uuid/v4';
import Peer from 'simple-peer';
import {createSimplePeer} from '../simplePeer';
import {createChannel, webrtcSignalsClient} from '../signalhub';
import {Observable} from 'rxjs';

const hub = signalhub('my-app', ['http://localhost:3001']);
/*global window*/
const channelId = 'test'; //window.location.hash.substring(1);
const clientId = uuid();
const serverId = 'server';

const dataTransform = data$ => {
  data$.subscribe(data => console.log('receive', data));
  return Observable.of({type: 'file/open', path: 'test.js'});
};

createChannel(hub, channelId, webrtcSignalsClient(clientId, serverId, createSimplePeer(() => new Peer({initiator: true, objectMode: true}))(dataTransform)));
