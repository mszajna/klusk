import {registerChangeWatcher, openDocument, closeDocument, writeDocument, saveDocument, forEachDocument} from './documents';

export default io => {

  registerChangeWatcher(path => {
    io.sockets.in(path).emit('overwritten', {path});
  });

  return socket => {
    socket.on('open', ({path}) => {
      openDocument(path, document => {
        socket.join(path, () => {
          socket.emit('load', {path, revision: document.operations.length, contents: document.document});
        });
      });
    });

    socket.on('write', ({path, rev, op}) => {
      writeDocument(path, rev, op, () => {
        socket.emit('ack', {path});
        socket.broadcast.in(path).emit('sync', {path, op});
      });
    });

    socket.on('save', ({path}) => {
      saveDocument(path, revision => {
        io.sockets.in(path).emit('saved', {path, revision});
      });
    });

    socket.on('close', ({path}) => {
      socket.leave(path, () => {
        if (!io.sockets.adapter.rooms[path]) {
          closeDocument(path);
        }
      });
    });

    socket.on('disconnect', () => {
      forEachDocument(path => {
        if (!io.sockets.adapter.rooms[path]) {
          closeDocument(path);
        }
      });
    });
  };
};
