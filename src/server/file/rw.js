import {Observable} from 'rxjs'
import {readFile, writeFile, readdir, stat} from './fs'
import {resolve, relative} from 'path'
import {flow, map, keyBy} from 'lodash/fp'

const fileDescription = realPath =>
  stat(realPath).map(stats => ({realPath, isDir: stats.isDirectory()}))

const directoryListing = realPath =>
  readdir(realPath).flatMap(files =>
    Observable.forkJoin(map(file => fileDescription(resolve(realPath, file)))(files)))

const toRelativeListing = (root, dir) =>
  flow(
    map(({realPath, isDir}) => ({isDir, path: relative(root, realPath), name: relative(dir, realPath)})),
    keyBy(({name}) => name)
  )

export const doOpen = root => path => {
  const realPath = resolve(root, path)
  return stat(realPath)
    .flatMap(stats => stats.isDirectory()
      ? directoryListing(realPath).map(toRelativeListing(root, realPath)).map(files => ({type: 'dir/list', path, files}))
      : readFile(realPath, 'utf-8').map(content => ({type: 'file/content', path, content})))
}

export const open = root => request$ => request$
  .filter(({type}) => type === 'file/open')
  .map(({path}) => path)
  .flatMap(doOpen(root))

export const save = root => request$ => request$
  .filter(({type}) => type === 'file/save')
  .flatMap(({path, content}) =>
    writeFile(resolve(root, path), content, 'utf-8')
      .map(() => ({type: 'file/saved', path})))
