import {assign, omit} from 'lodash/fp';
import {watch} from 'chokidar';
import {Observable} from 'rxjs';

export const watchFile = (fileChanged$) => (subscribe$, unsubscribe$) =>
  subscribe$.map(path => ({isWatched: true, path}))
    .merge(unsubscribe$.map(path => ({isWatched: false, path})))
    .groupBy(({path}) => path, ({isWatched}) => isWatched)
    .flatMap(isWatched$ =>
      fileChanged$.withLatestFrom(isWatched$)
        .filter(([path, isWatched]) => path === isWatched$.key && isWatched)
        .map(([path]) => path));


export const subscriptions = request$ => request$
  .filter(({type}) => type === 'file/open')
  .map(({path}) => path);

export const unsubscriptions = request$ => request$
  .filter(({type}) => type === 'file/close')
  .map(({path}) => path);

export const overriden = watchFile$ => watchFile$.map(path => ({type: 'overriden', path}));

export const createDirectoryWatcher = root => request$ => {
  const watcher = watch('.', {cwd: root});

  return overriden(watchFile(Observable.fromEvent(watcher, 'change'))(subscriptions(request$), unsubscriptions(request$)));
};
