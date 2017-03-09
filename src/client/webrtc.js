import signalhub from 'signalhub';
import uuid from 'uuid/v4';
import Peer from 'simple-peer';
import {openDocument, saveCurrentDocument} from './ace';
import {createSimplePeer} from '../simplePeer';
import {createChannel, webrtcSignalsClient} from '../signalhub';
import merge from '../merge';
import ace from 'brace';
import 'brace/theme/tomorrow_night_eighties';
import 'brace/mode/javascript';

const hub = signalhub('my-app', ['http://localhost:3001']);
const channelId = 'test';
const clientId = uuid();
const serverId = 'server';

const editor = ace.edit("editor");
editor.setTheme('ace/theme/tomorrow_night_eighties');

const dataTransform = merge(saveCurrentDocument(editor), openDocument(editor, 'test.js'));

createChannel(hub, channelId, webrtcSignalsClient(clientId, serverId, createSimplePeer(() => new Peer({initiator: true, objectMode: true}))(dataTransform)));
