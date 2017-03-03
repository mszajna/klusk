import {Server as OtDocument, TextOperation} from 'ot';
import {mapKeys} from 'lodash/fp';
import fs from 'fs';

const documents = {};

const openDocument = (path, callback) => {
  if (documents[path]) {
    callback(documents[path]);
  } else {
    fs.readFile(`.${path}`, 'utf8', (err, data) => {
      if (err) {console.log(err); return;}
      documents[path] = new OtDocument(data);
      callback(documents[path]);
    });
  }
};

export default io => socket => {
  socket.on('open', ({path}) => {
    openDocument(path, () => {
      socket.join(path, () => {
        socket.emit('load', {path, revision: documents[path].operations.length, contents: documents[path].document});
      });
    });
  });

  socket.on('write', ({path, rev, op}) => {
    try {
      documents[path].receiveOperation(rev, TextOperation.fromJSON(op));
      socket.emit('ack', {path});
      socket.broadcast.in(path).emit('sync', {path, op});
    } catch (e) {
      console.log(e, op);
    }
  });

  socket.on('close', ({path}) => {
    socket.leave(path, () => {
      if (!io.sockets.adapter.rooms[path]) {
        delete documents[path];
      }
    });
  });

  socket.on('disconnect', () => {
    mapKeys(path => {
      if (!io.sockets.adapter.rooms[path]) {
        delete documents[path];
      }
    })(documents);
  });
};
