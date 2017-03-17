import {watch} from 'chokidar'
import {Observable} from 'rxjs'
import {assign, omit, flow} from 'lodash/fp'
import {dirname} from 'path'
import {ifMatch, isType, toType, map, unwrap} from '../../observables'

const updateWatched = (watched, {isWatched, path}) => isWatched
  ? assign(watched, {[path]: true})
  : omit(watched, path)

export const watched = (subscribe$, unsubscribe$) =>
  subscribe$.map(path => ({isWatched: true, path}))
    .merge(unsubscribe$.map(path => ({isWatched: false, path})))
    .scan(updateWatched, {})

export const ifWatched = ifMatch(({path}, watched) => watched[path])

export const ifInWatchedDirectory =
  ifMatch(({path}, watched) => watched[path] || watched[dirname(path)])

// API

export const subscriptions = flow(isType('file/open'), unwrap('path'))

export const unsubscriptions = flow(isType('file/close'), unwrap('path'))

const fileDetails = ({path, stats}) => ({path, isDir: stats.isDirectory()})

export const overriden = flow(map(fileDetails), toType('file/overriden'))

export const created = flow(map(fileDetails), toType('file/created'))

export const deleted = toType('file/deleted')

export const createDirectoryWatcher = root => request$ => {
  const watcher = watch('.', {cwd: root, ignoreInitial: true, ignored: 'node_modules/**'})
  const watched$ = watched(subscriptions(request$), unsubscriptions(request$))

  const pathAndStats = (path, stats) => ({path, stats})

  const add$ = Observable.fromEvent(watcher, 'add', pathAndStats)
  const addDir$ = Observable.fromEvent(watcher, 'addDir', pathAndStats)
  const change$ = Observable.fromEvent(watcher, 'change', pathAndStats)
  const unlink$ = Observable.fromEvent(watcher, 'unlink', pathAndStats)
  const unlinkDir$ = Observable.fromEvent(watcher, 'unlinkDir', pathAndStats)

  const created$ = created(ifInWatchedDirectory(watched$)(add$.merge(addDir$)))
  const overriden$ = overriden(ifWatched(watched$)(change$))
  const deleted$ = deleted(ifInWatchedDirectory(watched$)(unlink$.merge(unlinkDir$)))

  return Observable.merge(created$, overriden$, deleted$)
}
