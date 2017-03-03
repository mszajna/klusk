import {registerChangeWatcher, openDocument, closeDocument, writeDocument, saveDocument, forEachDocument} from './documentStore';

export default (io, documentStore) => {

  registerChangeWatcher(documentStore)(path => {
    io.sockets.in(path).emit('overwritten', {path});
  });

  return socket => {
    socket.on('open', ({path, rev}) => {
      openDocument(documentStore)(path, (contents, rev) => {
        socket.emit('load', {path, rev, contents});
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
      saveDocument(documentStore)(path, rev => {
        io.sockets.in(path).emit('saved', {path, rev});
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
