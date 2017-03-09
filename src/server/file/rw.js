import {Observable} from 'rxjs'
import {readFile, writeFile} from 'fs'
import {resolve} from 'path'

export const open = root => request$ => request$
  .filter(({type}) => type === 'file/open')
  .flatMap(({path}) =>
    Observable.bindNodeCallback(readFile)(resolve(root, path), 'utf-8')
      .map(content => ({type: 'file/content', path, content})))

export const save = root => request$ => request$
  .filter(({type}) => type === 'file/save')
  .flatMap(({path, content}) =>
    Observable.bindNodeCallback(writeFile)(resolve(root, path), content, 'utf-8')
      .map(() => ({type: 'file/saved', path})))
