import {Server, TextOperation} from 'ot';
import {mapKeys} from 'lodash/fp';
import {readFile, writeFile} from 'fs';
import {watch} from 'chokidar';

export default root => ({
  root,
  documents: {},
  watcher: watch([])
});

export const openDocument = ({documents, watcher}) => (path, callback) => {
  if (documents[path]) {
    callback(documents[path]);
  } else {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        console.log('Error opening', path, err);
        return;
      }
      console.log('Open', path);

      documents[path] = new Server(data);
      watcher.add(path);
      callback(documents[path]);
    });
  }
};

export const closeDocument = ({documents, watcher}) => (path) => {
  console.log('Close', path);
  watcher.unwatch(path);
  delete documents[path];
};

export const saveDocument = ({documents}) => (path, callback) => {
  const revision = documents[path].operations.length;
  documents[path].isUpdating = true;
  writeFile(path, documents[path].document, (err) => {
    documents[path].isUpdating = false;
    if (err) {
      console.log('Error saving', path, err);
      return;
    }
    console.log('Saved', path);
    callback(revision);
  });
};

export const writeDocument = ({documents}) => (path, rev, op, callback) => {
  try {
    documents[path].receiveOperation(rev, TextOperation.fromJSON(op));
    callback();
  } catch (e) {
    console.log('Error writing', path, e);
  }
};

export const forEachDocument = ({documents}) => callback => {
  mapKeys(callback)(documents);
};

export const registerChangeWatcher = ({documents, watcher}) => callback => {
  watcher.on('change', path => {
    if (documents[path].isUpdating) return;
    closeDocument({documents, watcher})(path);
    callback(path);
  });
};
