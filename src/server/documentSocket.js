import {registerChangeWatcher, openDocument, closeDocument, writeDocument, saveDocument, forEachDocument} from './documentStore';

export default (io, documentStore) => {

  registerChangeWatcher(documentStore)(path => {
    io.sockets.in(path).emit('overwritten', {path});
  });

  return socket => {
    socket.on('open', ({path}) => {
      openDocument(documentStore)(path, document => {
        socket.emit('load', {path, revision: document.operations.length, contents: document.document});
        socket.join(path);
      });
    });

    socket.on('write', ({path, rev, op}) => {
      writeDocument(documentStore)(path, rev, op, () => {
        socket.emit('ack', {path});
        socket.broadcast.in(path).emit('sync', {path, op});
      });
    });

    socket.on('save', ({path}) => {
      saveDocument(documentStore)(path, revision => {
        io.sockets.in(path).emit('saved', {path, revision});
      });
    });

    socket.on('close', ({path}) => {
      socket.leave(path, () => {
        if (!io.sockets.adapter.rooms[path]) {
          closeDocument(documentStore)(path);
        }
      });
    });

    socket.on('disconnect', () => {
      forEachDocument(documentStore)(path => {
        if (!io.sockets.adapter.rooms[path]) {
          closeDocument(documentStore)(path);
        }
      });
    });
  };
};
