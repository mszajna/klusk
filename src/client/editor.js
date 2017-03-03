import ace from 'brace';
import 'brace/mode/javascript'; 
import {fromAceDelta, toAceDeltas} from './aceOt';
import {Client, TextOperation} from 'ot';
import io from 'socket.io-client';

const editor = ace.edit("editor");

const documents = {};

/*global window*/
const path = window.location.pathname.startsWith('/file/') ? window.location.pathname.substring('/file'.length) : '/';

const socket = io('/');
socket.on('connect', () => socket.emit('open', {path}));

socket.on('load', ({path, revision, contents}) => {
  const editSession = ace.createEditSession(contents, 'ace/mode/javascript');
  const document = editSession.getDocument();

  const client = documents[path] = new Client(revision);
  var isUpdating = false;
  document.on('change', delta => {
    if (isUpdating) return;
    client.applyClient(fromAceDelta(delta, document));
  });
  client.applyOperation = op => {
    isUpdating = true;
    document.applyDeltas(toAceDeltas(op, document));
    isUpdating = false;
  };
  client.sendOperation = (rev, op) => socket.emit('write', {path, rev, op});

  editor.setSession(editSession);
});

socket.on('ack', ({path}) => {
  documents[path].serverAck();
});

socket.on('sync', ({path, op}) => {
  documents[path].applyServer(TextOperation.fromJSON(op));
});
