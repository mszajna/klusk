import {Server, TextOperation} from 'ot';
import {mapKeys} from 'lodash/fp';
import {readFile, writeFile} from 'fs';
import {watch} from 'chokidar';
import {resolve, relative} from 'path';

export const directoryStore = root => ({
  documents: {},
  watcher: watch([]),
  resolve: path => resolve(root, path),
  relative: localPath => relative(root, localPath)
});

export const openDocument = ({documents, resolve, watcher}) => (path, callback) => {
  if (documents[path]) {
    callback(documents[path].document, documents[path].operations.length);
  } else {
    const localPath = resolve(path);
    readFile(localPath, 'utf8', (err, data) => {
      if (err) {
        console.log('Error opening', path, err);
        return;
      }
      console.log('Opened', path);

      documents[path] = new Server(data);
      watcher.add(localPath);
      callback(data, 0);
    });
  }
};

export const closeDocument = ({documents, resolve, watcher}) => (path) => {
  watcher.unwatch(resolve(path));
  delete documents[path];
  console.log('Closed', path);
};

export const saveDocument = ({documents, resolve}) => (path, callback) => {
  const revision = documents[path].operations.length;
  documents[path].isUpdating = true;
  writeFile(resolve(path), documents[path].document, (err) => {
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
    const transformed = documents[path].receiveOperation(rev, TextOperation.fromJSON(op));
    callback(transformed.ops);
  } catch (e) {
    console.log('Error writing', path, e);
  }
};

export const forEachDocument = ({documents}) => callback => {
  mapKeys(callback)(documents);
};

export const registerChangeWatcher = store => callback => {
  const {documents, relative, watcher} = store;
  watcher.on('change', localPath => {
    const path = relative(localPath);
    if (documents[path].isUpdating) return;
    console.log('Change detected', path);
    closeDocument(store)(path);
    callback(path);
  });
};
