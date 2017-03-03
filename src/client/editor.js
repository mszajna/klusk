import ace from 'brace';
import 'brace/theme/tomorrow_night_eighties';
import 'brace/mode/javascript';
import {mapKeys} from 'lodash/fp';
import {fromAceDelta, toAceDeltas} from './aceOt';
import {Client, TextOperation} from 'ot';
import io from 'socket.io-client';

const editor = ace.edit("editor");
editor.setTheme('ace/theme/tomorrow_night_eighties');

const documents = {};

/*global window*/
const path = window.location.pathname.startsWith('/edit/') ? window.location.pathname.substring('/edit/'.length) : '/dev/null';

const socket = io('/');

editor.commands.addCommand({
  name: 'save',
  bindKey: {win: 'Ctrl-s', mac: 'Command-s'},
  exec: () => {
    socket.emit('save', {path: editor.getSession().getDocument().path});
  }
});

socket.on('connect', () => socket.emit('open', {path}));

socket.on('reconnect', () => {
  mapKeys(path => socket.emit('open', {path}) )(documents);
});

socket.on('load', ({path, rev, contents}) => {
  const editSession = ace.createEditSession(contents, 'ace/mode/javascript');
  const document = editSession.getDocument();
  document.path = path;

  const client = documents[path] = new Client(rev);
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

socket.on('saved', ({path}) => console.log('saved', path));

socket.on('overwritten', ({path}) => socket.emit('open', {path}));
