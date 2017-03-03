import {Server, TextOperation} from 'ot';
import {mapKeys} from 'lodash/fp';
import {readFile, writeFile} from 'fs';
import {watch} from 'chokidar';

var documents = {};
const watcher = watch([]);

export const openDocument = (path, callback) => {
  if (documents[path]) {
    callback(documents[path]);
  } else {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Open', path);

      documents[path] = new Server(data);
      watcher.add(path);
      callback(documents[path]);
    });
  }
};

export const closeDocument = (path) => {
  console.log('Close', path);
  watcher.unwatch(path);
  delete documents[path];
};

export const saveDocument = (path, callback) => {
  const revision = documents[path].operations.length;
  documents[path].isUpdating = true;
  writeFile(path, documents[path].document, (err) => {
    documents[path].isUpdating = false;
    if (err) {
      console.log(err);
      return;
    }
    console.log('Saved', path);
    callback(revision);
  });
};

export const writeDocument = (path, rev, op, callback) => {
  try {
    documents[path].receiveOperation(rev, TextOperation.fromJSON(op));
    callback();
  } catch (e) {
    console.log('Error writing to document', path, e);
  }
};

export const forEachDocument = callback => {
  mapKeys(callback)(documents);
};

export const registerChangeWatcher = callback => {
  watcher.on('change', path => {
    if (documents[path].isUpdating) return;
    closeDocument(path);
    callback(path);
  });
};
